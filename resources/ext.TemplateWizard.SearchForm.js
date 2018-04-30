/**
 * @class
 * @constructor
 * @param {OO.ui.ProcessDialog} dialog The dialog to attach the form to.
 * @param {Object} [config] Configuration options.
 */
mediaWiki.TemplateWizard.SearchForm = function mediaWikiTemplateWizardSearchForm( dialog, config ) {
	config = $.extend( {
		padded: true,
		expanded: true
	}, config );
	mediaWiki.TemplateWizard.SearchForm.super.call( this, config );
	this.dialog = dialog;

	this.searchWidget = new mediaWiki.TemplateWizard.SearchField( {}, this );

	// Recent templates menu.
	this.recentTemplates = new OO.ui.MenuSelectWidget();

	// Add to the SearchForm layout.
	this.$element
		.addClass( 'ext-templatewizard-searchform' )
		.append(
			this.searchWidget.$element,
			this.recentTemplates.$element
		);
};

OO.inheritClass( mediaWiki.TemplateWizard.SearchForm, OO.ui.PanelLayout );

mediaWiki.TemplateWizard.SearchForm.prototype.showTemplate = function ( templateData ) {
	this.dialog.showTemplate( templateData );
	// @TODO Add to recent templates.
};

mediaWiki.TemplateWizard.SearchForm.prototype.focus = function () {
	this.searchWidget.$input.focus();
};
