/**
 * @class
 * @constructor
 * @param {Object} [config] Configuration options.
 * @cfg {mw.Api} [api] Optional MediaWiki API, for testing
 * @param {mw.TemplateWizard.SearchForm} searchForm The form that this field is attached to.
 */
mw.TemplateWizard.SearchField = function MWTemplateWizardSearchField( config, searchForm ) {
	config = $.extend( {
		placeholder: OO.ui.deferMsg( 'templatewizard-search-placeholder' ),
		icon: 'search'
	}, config );
	mw.TemplateWizard.SearchField.super.call( this, config );
	OO.ui.mixin.LookupElement.call( this );

	this.limit = config.limit || 10;
	this.api = config.api || new mw.Api();
	this.searchForm = searchForm;
};

OO.inheritClass( mw.TemplateWizard.SearchField, OO.ui.ComboBoxInputWidget );

OO.mixinClass( mw.TemplateWizard.SearchField, OO.ui.mixin.LookupElement );

/**
 * This helper method is modeled after mw.widgets.TitleWidget, even if this is *not* a TitleWidget.
 *
 * @private
 * @method
 * @param {string} query What the user typed
 * @return {Object} Parameters for the MediaWiki action API
 */
mw.TemplateWizard.SearchField.prototype.getApiParams = function ( query ) {
	var params = {
		action: 'templatedata',
		includeMissingTitles: 1,
		lang: mw.config.get( 'wgUserLanguage' ),
		generator: 'prefixsearch',
		gpssearch: query,
		gpsnamespace: mw.config.get( 'wgNamespaceIds' ).template,
		gpslimit: this.limit,
		redirects: 1
	};

	if ( mw.config.get( 'wgTemplateWizardConfig' ).cirrusSearchLookup ) {
		$.extend( params, {
			generator: 'search',
			gsrsearch: params.gpssearch,
			gsrnamespace: params.gpsnamespace,
			gsrlimit: params.gpslimit,
			gsrprop: [ 'redirecttitle' ]
		} );
		// Adding the asterisk to emulate a prefix search behavior. It does not make sense in all
		// cases though. We're limiting it to be add only of the term ends with a letter or numeric
		// character.
		var endsWithAlpha;
		try {
			// TODO: Convert to literal when IE11 compatibility was dropped
			// eslint-disable-next-line prefer-regex-literals
			endsWithAlpha = new RegExp( '[0-9a-z\\p{L}\\p{N}]$', 'iu' );
		} catch ( e ) {
			// TODO: Remove when IE11 compatibility was dropped
			endsWithAlpha = /[0-9a-z\xC0-\uFFFF]$/i;
		}
		if ( endsWithAlpha.test( params.gsrsearch ) ) {
			params.gsrsearch += '*';
		}

		delete params.gpssearch;
		delete params.gpsnamespace;
		delete params.gpslimit;
	}

	return params;
};

/**
 * Get a new request object of the current lookup query value.
 *
 * @protected
 * @method
 * @return {jQuery.Promise} jQuery AJAX object, or promise object with an .abort() method
 */
mw.TemplateWizard.SearchField.prototype.getLookupRequest = function () {
	var query = this.getValue(),
		params = this.getApiParams( query ),
		promise = this.api.get( params );

	// No point in running prefix search a second time
	if ( params.generator !== 'prefixsearch' ) {
		promise = promise
			.then( this.addExactMatch.bind( this ) )
			.promise( { abort: function () {} } );
	}

	return promise;
};

/**
 * @private
 * @method
 * @param {Object} response Action API response from server
 * @return {Object} Modified response
 */
mw.TemplateWizard.SearchField.prototype.addExactMatch = function ( response ) {
	var query = this.getValue(),
		lowerQuery = query.trim().toLowerCase();
	if ( !response.pages || !lowerQuery ) {
		return response;
	}

	var containsExactMatch = Object.keys( response.pages ).some( function ( pageId ) {
		var page = response.pages[ pageId ],
			title = mw.Title.newFromText( page.title );
		return title.getMainText().toLowerCase() === lowerQuery;
	} );
	if ( containsExactMatch ) {
		return response;
	}

	return this.api.get( {
		action: 'templatedata',
		includeMissingTitles: 1,
		lang: mw.config.get( 'wgUserLanguage' ),
		// Can't use a direct lookup by title because we need this to be case-insensitive
		generator: 'prefixsearch',
		gpssearch: query,
		gpsnamespace: mw.config.get( 'wgNamespaceIds' ).template,
		gpslimit: 1
	} ).then( function ( prefixMatches ) {
		// action=templatedata returns page objects in `{ pages: {} }`, keyed by page id
		for ( var pageId in prefixMatches.pages ) {
			if ( !( pageId in response.pages ) ) {
				var prefixMatch = prefixMatches.pages[ pageId ];
				prefixMatch.index = 0;
				response.pages[ pageId ] = prefixMatch;
			}
		}
		return response;
	}, function () {
		// Proceed with the unmodified response in case the additional API request failed
		return response;
	} )
		.promise( { abort: function () {} } );
};

/**
 * Pre-process data returned by the request from {@see getLookupRequest}.
 *
 * The return value of this function will be cached, and any further queries for the given value
 * will use the cache rather than doing API requests.
 *
 * @protected
 * @method
 * @param {Object} response Response from server
 * @return {Object[]} Config for {@see mw.TemplateWizard.SearchResult} widgets
 */
mw.TemplateWizard.SearchField.prototype.getLookupCacheDataFromResponse = function ( response ) {
	var searchResults,
		templateData = response.pages;

	// Prepare the separate "redirects" structure to be converted to the CirrusSearch
	// "redirecttitle" field
	var redirectedFrom = {};
	if ( response.redirects ) {
		response.redirects.forEach( function ( redirect ) {
			redirectedFrom[ redirect.to ] = redirect.from;
		} );
	}

	searchResults = Object.keys( templateData ).map( function ( pageId ) {
		var page = templateData[ pageId ];

		if ( !page.redirecttitle && page.title in redirectedFrom ) {
			page.redirecttitle = redirectedFrom[ page.title ];
		}

		/**
		 * Config for the {@see mw.TemplateWizard.SearchResult} widget:
		 * - data: {@see OO.ui.Element} and getData()
		 * - label: {@see OO.ui.mixin.LabelElement} and getLabel()
		 * - description: {@see mw.TemplateWizard.SearchResult}
		 */
		return {
			data: page,
			label: mw.Title.newFromText( page.title ).getMainText(),
			description: page.description
		};
	} );

	var lowerQuery = this.getValue().trim().toLowerCase();
	searchResults.sort( function ( a, b ) {
		// Force exact matches to be at the top
		if ( a.label.toLowerCase() === lowerQuery ) {
			return -1;
		} else if ( b.label.toLowerCase() === lowerQuery ) {
			return 1;
		}

		// Restore original (prefix)search order, possibly messed up because of the generator
		if ( 'index' in a.data && 'index' in b.data ) {
			return a.data.index - b.data.index;
		}

		return 0;
	} );

	// Might be to many results because of the additional exact match search above
	if ( searchResults.length > this.limit ) {
		searchResults.splice( this.limit );
	}

	return searchResults;
};

/**
 * Get a list of menu option widgets from the (possibly cached) data returned by
 * {@see getLookupCacheDataFromResponse}.
 *
 * @protected
 * @method
 * @param {Object[]} data Search results from {@see getLookupCacheDataFromResponse}
 * @return {OO.ui.MenuOptionWidget[]}
 */
mw.TemplateWizard.SearchField.prototype.getLookupMenuOptionsFromData = function ( data ) {
	return data.map( function ( config ) {
		return new mw.TemplateWizard.SearchResult( config );
	} );
};

/**
 * Handle menu item 'choose' event, updating the text input value to the value of the clicked item.
 *
 * @protected
 * @param {OO.ui.MenuOptionWidget} item Selected item
 */
mw.TemplateWizard.SearchField.prototype.onLookupMenuChoose = function ( item ) {
	this.setValue( item.getLabel() );
	this.searchForm.showTemplate( item.getData() );
};
