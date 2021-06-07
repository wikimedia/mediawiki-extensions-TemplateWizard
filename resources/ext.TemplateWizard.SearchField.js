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
	return {
		action: 'templatedata',
		generator: 'prefixsearch',
		gpssearch: query,
		gpsnamespace: mw.config.get( 'wgNamespaceIds' ).template,
		gpslimit: this.limit,
		redirects: 1,
		includeMissingTitles: 1,
		lang: mw.config.get( 'wgUserLanguage' )
	};
};

/**
 * Get a new request object of the current lookup query value.
 *
 * @protected
 * @method
 * @return {jQuery.Promise} jQuery AJAX object, or promise object with an .abort() method
 */
mw.TemplateWizard.SearchField.prototype.getLookupRequest = function () {
	return this.api.get( this.getApiParams( this.getValue() ) );
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

	this.templateData = templateData;

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
