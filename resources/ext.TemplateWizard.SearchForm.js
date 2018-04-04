/**
 * @class
 * @constructor
 * @param {OO.ui.ProcessDialog} dialog The dialog to attach the form to.
 * @param {Object} [config] Configuration options.
 */
mediaWiki.TemplateWizard.SearchForm = function mediaWikiTemplateWizardSearchForm( dialog, config ) {
	mediaWiki.TemplateWizard.SearchForm.super.call( this, $.extend( { padded: true, expanded: true }, config ) );
	this.dialog = dialog;

	this.titleSearchWidget = new mediaWiki.widgets.TitleInputWidget( {
		validate: true,
		namespace: mediaWiki.config.get( 'wgNamespaceIds' ).template
	} );
	this.titleSearchWidget.connect( this, { change: 'onSearchWidgetChange', enter: 'onSearchWidgetEnter' } );
	this.searchButton = new OO.ui.ButtonWidget( { label: OO.ui.deferMsg( 'templatewizard-use' ), flags: [ 'progressive' ] } );
	this.searchButton.connect( this, { click: 'onSearchButtonClick' } );
	this.searchField = new OO.ui.ActionFieldLayout(
		this.titleSearchWidget,
		this.searchButton,
		{ label: OO.ui.deferMsg( 'templatewizard-select-template' ) }
	);
	this.titleSearchWidget.emit( 'change' );
	this.$element.append( this.searchField.$element );
};
OO.inheritClass( mediaWiki.TemplateWizard.SearchForm, OO.ui.PanelLayout );

mediaWiki.TemplateWizard.SearchForm.prototype.getTemplateForm = function () {
	return this.templateForm;
};

mediaWiki.TemplateWizard.SearchForm.prototype.onSearchButtonClick = function () {
	this.searchField.setErrors( [] );
	try {
		this.templateForm = new mediaWiki.TemplateWizard.TemplateForm( this.dialog, this.titleSearchWidget.value );
	} catch ( e ) {
		this.titleSearchWidget.$input.focus();
		this.titleSearchWidget.$element.addClass( 'oo-ui-flaggedElement-invalid' );
		this.dialog.actions.setMode( 'choose' );
		this.searchField.setErrors( [ e.message ] );
		return;
	}
	this.dialog.setResultsPanel( this.templateForm.$element );
	this.dialog.actions.setMode( 'insert' );
};

mediaWiki.TemplateWizard.SearchForm.prototype.onSearchWidgetChange = function () {
	this.titleSearchWidget.$element.removeClass( 'oo-ui-flaggedElement-invalid' );
	this.searchButton.setDisabled( !this.titleSearchWidget.value );
};

mediaWiki.TemplateWizard.SearchForm.prototype.onSearchWidgetEnter = function () {
	this.searchButton.$button.focus();
	this.searchButton.emit( 'click' );
};
