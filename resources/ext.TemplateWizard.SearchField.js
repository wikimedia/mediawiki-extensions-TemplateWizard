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
		generator: 'prefixsearch',
		gpssearch: query,
		gpsnamespace: mw.config.get( 'wgNamespaceIds' ).template,
		gpslimit: this.limit,
		redirects: 1,
		includeMissingTitles: 1,
		lang: mw.config.get( 'wgUserLanguage' )
	};

	if ( mw.config.get( 'wgTemplateWizardConfig' ).cirrusSearchLookup ) {
		$.extend( params, {
			generator: 'search',
			gsrsearch: params.gpssearch,
			gsrnamespace: params.gpsnamespace,
			gsrlimit: params.gpslimit
			// TODO: Display redirects
			// gsrprop: [ 'redirecttitle' ]
		} );
		// Searching for "foo *" is pointless. Don't normalize it to "foo*" either but leave it
		// unchanged. This makes the word "foo" behave the same in "foo " and "foo bar". In both
		// cases it's not considered a prefix any more.
		if ( !/\s$/.test( params.gsrsearch ) ) {
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
		generator: 'prefixsearch',
		gpssearch: query,
		gpsnamespace: mw.config.get( 'wgNamespaceIds' ).template,
		gpslimit: 1
	} ).then( function ( exactMatch ) {
		var pageId = ( Object.keys( exactMatch.pages ) )[ 0 ];
		if ( pageId && !( pageId in response.pages ) ) {
			response.pages[ pageId ] = exactMatch.pages[ pageId ];
		}
		return response;
	}, function () {
		// Proceed with the unmodified response in case the additional API request failed
		return response;
	} )
		.promise( { abort: function () {} } );
};

/**
 * Pre-process data returned by the request from #getLookupRequest.
 *
 * The return value of this function will be cached, and any further queries for the given value
 * will use the cache rather than doing API requests.
 *
 * @protected
 * @method
 * @param {Object} response Response from server
 * @return {Array} Cached result data
 */
mw.TemplateWizard.SearchField.prototype.getLookupCacheDataFromResponse = function ( response ) {
	var searchResults,
		templateData = response.pages;

	searchResults = Object.keys( templateData ).map( function ( pageId ) {
		var page = templateData[ pageId ];
		// Store the main text as well, so we don't have to re-do this later.
		page.titleMainText = mw.Title.newFromText( page.title ).getMainText();
		return {
			data: page,
			label: page.titleMainText,
			description: page.description
		};
	} );

	// Force exact matches to be at the top
	var lowerQuery = this.getValue().trim().toLowerCase();
	searchResults.sort( function ( a ) {
		return a.label.toLowerCase() === lowerQuery ? -1 : 0;
	} );

	// Might be to many results because of the additional exact match search above
	if ( searchResults.length > this.limit ) {
		searchResults = searchResults.slice( 0, this.limit );
	}
	return searchResults;
};

/**
 * Get a list of menu option widgets from the (possibly cached) data returned by
 * #getLookupCacheDataFromResponse.
 *
 * @protected
 * @method
 * @param {Array} data Cached result data
 * @return {OO.ui.MenuOptionWidget[]} Menu items
 */
mw.TemplateWizard.SearchField.prototype.getLookupMenuOptionsFromData = function ( data ) {
	return data.map( function ( result ) {
		return new mw.TemplateWizard.SearchResult( result );
	} );
};

/**
 * Handle menu item 'choose' event, updating the text input value to the value of the clicked item.
 *
 * @protected
 * @param {OO.ui.MenuOptionWidget} item Selected item
 */
mw.TemplateWizard.SearchField.prototype.onLookupMenuChoose = function ( item ) {
	this.setValue( item.getData().titleMainText );
	this.searchForm.showTemplate( item.getData() );
};
