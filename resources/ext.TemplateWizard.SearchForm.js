/**
 * @class
 * @constructor
 * @param {OO.ui.ProcessDialog} dialog The dialog to attach the form to.
 * @param {Object} [config] Configuration options.
 * @cfg {string} [contentDir] The direction of the page content
 */
mw.TemplateWizard.SearchForm = function MWTemplateWizardSearchForm( dialog, config ) {
	config = $.extend( {
		padded: true,
		expanded: true
	}, config );
	mw.TemplateWizard.SearchForm.super.call( this, config );
	this.dialog = dialog;

	this.searchWidget = new mw.TemplateWizard.SearchField( {}, this );

	// Recent templates menu.
	this.recentTemplates = new OO.ui.MenuSelectWidget();

	// Add to the SearchForm layout.
	this.$element
		.addClass( 'ext-templatewizard-searchform' )
		.append( $( '<div>' )
			// The direction should remain the site-wide language direction
			// since the template language is assumed to be wiki language
			.css( 'direction', config.contentDir || 'ltr' )
			.append(
				this.searchWidget.$element,
				this.recentTemplates.$element
			)
		);

	// Temporary feedback message when templateSearchImprovements is true T284560
	// TODO: remove when templateSearchImprovements are out of beta
	if ( mw.config.get( 'wgTemplateWizardConfig' ).cirrusSearchLookup ) {
		new mw.TemplateWizard.DismissibleMessageWidget( {
			messageKey: 'templatewizard-search-feedback-message',
			classes: [ 'ext-templatewizard-feedback-message' ]
		} )
			.connect( this, { close: 'focus' } )
			.$element.prependTo( this.$element );
	}
};

OO.inheritClass( mw.TemplateWizard.SearchForm, OO.ui.PanelLayout );

mw.TemplateWizard.SearchForm.prototype.showTemplate = function ( templateData ) {
	this.dialog.showTemplate( templateData );
	// @TODO Add to recent templates.
};

mw.TemplateWizard.SearchForm.prototype.focus = function () {
	this.searchWidget.$input.trigger( 'focus' );
};
