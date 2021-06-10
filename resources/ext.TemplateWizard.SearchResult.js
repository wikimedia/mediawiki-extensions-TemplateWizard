/**
 * @class
 * @constructor
 * @param {Object} [config] Configuration options.
 * @cfg {jQuery|string} [description=''] Search result description
 * @cfg {string} [data.redirecttitle] Page title for the "redirected from" message
 */
mw.TemplateWizard.SearchResult = function MWTemplateWizardSearchResult( config ) {
	mw.TemplateWizard.SearchResult.super.call( this, config );

	if ( config.data.redirecttitle ) {
		var redirecttitle = new mw.Title( config.data.redirecttitle ).getMainText();
		$( '<div>' )
			.addClass( 'ext-templatewizard-redirectedfrom' )
			.text( mw.msg( 'redirectedfrom', redirecttitle ) )
			.appendTo( this.$element );
	}

	$( '<span>' )
		.addClass( 'ext-templatewizard-description' )
		.append( $( '<bdi>' ).text( config.description || '' ) )
		.appendTo( this.$element );
};

OO.inheritClass( mw.TemplateWizard.SearchResult, OO.ui.MenuOptionWidget );
