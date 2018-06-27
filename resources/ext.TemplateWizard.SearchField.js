/**
 * @class
 * @constructor
 * @param {Object} [config] Configuration options.
 * @param {mediaWiki.TemplateWizard.SearchForm} searchForm The form that this field is attached to.
 */
mediaWiki.TemplateWizard.SearchField = function mediaWikiTemplateWizardSearchField( config, searchForm ) {
	config = $.extend( {
		placeholder: OO.ui.deferMsg( 'templatewizard-search-placeholder' )
	}, config );
	mediaWiki.TemplateWizard.SearchField.super.call( this, config );
	OO.ui.mixin.LookupElement.call( this );

	this.searchForm = searchForm;
};

OO.inheritClass( mediaWiki.TemplateWizard.SearchField, OO.ui.ComboBoxInputWidget );

OO.mixinClass( mediaWiki.TemplateWizard.SearchField, OO.ui.mixin.LookupElement );

/**
 * Get a new request object of the current lookup query value.
 *
 * @protected
 * @method
 * @return {jQuery.Promise} jQuery AJAX object, or promise object with an .abort() method
 */
mediaWiki.TemplateWizard.SearchField.prototype.getLookupRequest = function () {
	return new mediaWiki.Api().get( {
		action: 'templatedata',
		generator: 'prefixsearch',
		gpssearch: this.getValue(),
		gpsnamespace: mediaWiki.config.get( 'wgNamespaceIds' ).template,
		redirects: true,
		includeMissingTitles: true,
		lang: mediaWiki.config.get( 'wgUserLanguage' )
	} );
};

/**
 * Pre-process data returned by the request from #getLookupRequest.
 *
 * The return value of this function will be cached, and any further queries for the given value
 * will use the cache rather than doing API requests.
 *
 * @protected
 * @method
 * @param {mixed} response Response from server
 * @return {mixed} Cached result data
 */
mediaWiki.TemplateWizard.SearchField.prototype.getLookupCacheDataFromResponse = function ( response ) {
	var searchResults = [];
	this.templateData = response.pages;
	$.each( this.templateData, function ( pageId, templateData ) {
		// Store the main text as well, so we don't have to re-do this.
		templateData.titleMainText = mediaWiki.Title.newFromText( templateData.title ).getMainText();
		searchResults.push( {
			data: templateData,
			label: templateData.titleMainText,
			description: templateData.description
		} );
	} );
	return searchResults;
};

/**
 * Get a list of menu option widgets from the (possibly cached) data returned by
 * #getLookupCacheDataFromResponse.
 *
 * @protected
 * @method
 * @param {mixed} data Cached result data, usually an array
 * @return {OO.ui.MenuOptionWidget[]} Menu items
 */
mediaWiki.TemplateWizard.SearchField.prototype.getLookupMenuOptionsFromData = function ( data ) {
	var menuOptions = [];
	$.each( data, function ( index, searchResult ) {
		var option = new mediaWiki.TemplateWizard.SearchResult( searchResult );
		menuOptions.push( option );
	} );
	return menuOptions;
};

/**
 * Handle menu item 'choose' event, updating the text input value to the value of the clicked item.
 *
 * @protected
 * @param {OO.ui.MenuOptionWidget} item Selected item
 */
mediaWiki.TemplateWizard.SearchField.prototype.onLookupMenuItemChoose = function ( item ) {
	this.setValue( item.getData().titleMainText );
	this.searchForm.showTemplate( item.getData() );
};
