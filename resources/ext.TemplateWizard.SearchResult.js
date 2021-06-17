/**
 * @class
 * @constructor
 * @param {Object} [config] Configuration options.
 * @cfg {jQuery|string} [description=''] Search result description
 * @cfg {string} [data.redirecttitle] Page title for the "redirected from" message
 */
mw.TemplateWizard.SearchResult = function MWTemplateWizardSearchResult( config ) {
	var $description;
	mw.TemplateWizard.SearchResult.super.call( this, config );

	// Description.
	$description = $( '<span>' )
		.addClass( 'ext-templatewizard-description' )
		.append( $( '<bdi>' ).text( config.description || '' ) );

	if ( config.data.redirecttitle ) {
		var redirecttitle = new mw.Title( config.data.redirecttitle ).getMainText();
		$( '<div>' )
			.addClass( 'ext-templatewizard-redirectedfrom' )
			.text( mw.msg( 'redirectedfrom', redirecttitle ) )
			.prependTo( $description );
	}

	this.$element.append( $description );
};

OO.inheritClass( mw.TemplateWizard.SearchResult, OO.ui.MenuOptionWidget );
