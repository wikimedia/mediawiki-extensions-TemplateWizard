/**
 * @class
 * @extends OO.ui.ComboBoxInputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options.
 * @param {number} [config.limit=10]
 * @param {mw.Api} [config.api] Optional MediaWiki API, for testing
 * @param {mw.TemplateWizard.SearchForm} searchForm The form that this field is attached to.
 */
mw.TemplateWizard.SearchField = function MWTemplateWizardSearchField( config, searchForm ) {
	config = Object.assign( {
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
	const params = {
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
		Object.assign( params, {
			generator: 'search',
			gsrsearch: params.gpssearch,
			gsrnamespace: params.gpsnamespace,
			gsrlimit: params.gpslimit,
			gsrprop: [ 'redirecttitle' ]
		} );
		// Adding the asterisk to emulate a prefix search behavior. It does not make sense in all
		// cases though. We're limiting it to be add only of the term ends with a letter or numeric
		// character.
		// eslint-disable-next-line es-x/no-regexp-unicode-property-escapes, prefer-regex-literals
		const endsWithAlpha = new RegExp( '[\\p{L}\\p{N}]$', 'u' );
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
	const query = this.getValue(),
		params = this.getApiParams( query );
	let promise = this.api.get( params );

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
	const query = this.getValue(),
		lowerQuery = query.trim().toLowerCase();
	if ( !response.pages || !lowerQuery ) {
		return response;
	}

	const containsExactMatch = Object.keys( response.pages ).some( ( pageId ) => {
		const page = response.pages[ pageId ],
			title = mw.Title.newFromText( page.title );
		return title.getMainText().toLowerCase() === lowerQuery;
	} );
	if ( containsExactMatch ) {
		return response;
	}

	const limit = this.limit;
	return this.api.get( {
		action: 'templatedata',
		includeMissingTitles: 1,
		lang: mw.config.get( 'wgUserLanguage' ),
		// Can't use a direct lookup by title because we need this to be case-insensitive
		generator: 'prefixsearch',
		gpssearch: query,
		gpsnamespace: mw.config.get( 'wgNamespaceIds' ).template,
		// Try to fill with prefix matches, otherwise just the top-1 prefix match
		gpslimit: limit
	} ).then( ( prefixMatches ) => {
		// action=templatedata returns page objects in `{ pages: {} }`, keyed by page id
		// Copy keys because the loop below needs an ordered array, not an object
		for ( const pageId in prefixMatches.pages ) {
			prefixMatches.pages[ pageId ].pageid = pageId;
		}
		// Make sure the loop below processes the results by relevance
		const pages = OO.getObjectValues( prefixMatches.pages ).sort( ( a, b ) => a.index - b.index );
		for ( const i in pages ) {
			const prefixMatch = pages[ i ];
			if ( !( prefixMatch.pageid in response.pages ) ) {
				// Move prefix matches to the top, indexed from -9 to 0, relevant for e.g. {{!!}}
				// Note: Sorting happens down in getLookupCacheDataFromResponse()
				prefixMatch.index -= limit;
				response.pages[ prefixMatch.pageid ] = prefixMatch;
			}
			// Check only after the top-1 prefix match is guaranteed to be present
			// Note: Might be 11 at this point, truncated in getLookupCacheDataFromResponse()
			if ( Object.keys( response.pages ).length >= limit ) {
				break;
			}
		}
		return response;
	},
	// Proceed with the unmodified response in case the additional API request failed
	() => response
	)
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
	const templateData = response.pages;

	// Prepare the separate "redirects" structure to be converted to the CirrusSearch
	// "redirecttitle" field
	const redirectedFrom = {};
	if ( response.redirects ) {
		response.redirects.forEach( ( redirect ) => {
			redirectedFrom[ redirect.to ] = redirect.from;
		} );
	}

	const searchResults = Object.keys( templateData ).map( ( pageId ) => {
		const page = templateData[ pageId ];

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
			label: mw.Title.newFromText( page.title ).getRelativeText( mw.config.get( 'wgNamespaceIds' ).template ),
			description: page.description
		};
	} );

	const lowerQuery = this.getValue().trim().toLowerCase();
	searchResults.sort( ( a, b ) => {
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
	return data.map( ( config ) => new mw.TemplateWizard.SearchResult( config ) );
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
