/**
 * @class
 * @extends OO.ui.MenuOptionWidget
 *
 * @constructor
 * @param {Object} config
 * @param {jQuery|string} [config.description=''] Search result description
 * @param {string} [config.data.redirecttitle] Page title for the "redirected from" message
 */
mw.TemplateWizard.SearchResult = function MWTemplateWizardSearchResult( config ) {
	mw.TemplateWizard.SearchResult.super.call( this, config );

	if ( config.data.redirecttitle ) {
		const redirecttitle = new mw.Title( config.data.redirecttitle )
			.getRelativeText( mw.config.get( 'wgNamespaceIds' ).template );
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
