/**
 * @class
 * @constructor
 * @param {Object} [config] Configuration options.
 * @cfg {jQuery|string} [description=''] Search result description
 */
mw.TemplateWizard.SearchResult = function MWTemplateWizardSearchResult( config ) {
	var $description;
	mw.TemplateWizard.SearchResult.super.call( this, config );

	// Description.
	$description = $( '<span>' )
		.addClass( 'ext-templatewizard-description' )
		.append( $( '<bdi>' ).text( config.description || '' ) );
	this.$element.append( $description );
};

OO.inheritClass( mw.TemplateWizard.SearchResult, OO.ui.MenuOptionWidget );
