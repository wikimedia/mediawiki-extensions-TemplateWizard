/**
 * @class
 * @constructor
 * @param {Object} [config] Configuration options.
 * @cfg {jQuery|string} [description=''] Search result description
 */
mediaWiki.TemplateWizard.SearchResult = function mediaWikiTemplateWizardSearchResult( config ) {
	var $description;
	mediaWiki.TemplateWizard.SearchResult.super.call( this, config );

	// Description.
	$description = $( '<span>' )
		.addClass( 'description' )
		.text( config.description || '' );
	this.$element.append( $description );
};

OO.inheritClass( mediaWiki.TemplateWizard.SearchResult, OO.ui.MenuOptionWidget );
