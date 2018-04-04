/**
 * The main dialog box for the TemplateWizard.
 * @class
 * @constructor
 * @extends OO.ui.ProcessDialog
 * @param {object} config
 */
mediaWiki.TemplateWizard.Dialog = function mediaWikiTemplateWizardDialog( config ) {
	mediaWiki.TemplateWizard.Dialog.super.call( this, config );
};
OO.inheritClass( mediaWiki.TemplateWizard.Dialog, OO.ui.ProcessDialog );
mediaWiki.TemplateWizard.Dialog.static.name = 'templateWizard';
mediaWiki.TemplateWizard.Dialog.static.title = OO.ui.deferMsg( 'templatewizard-dialog-title' );
mediaWiki.TemplateWizard.Dialog.static.actions = [
	{ label: OO.ui.deferMsg( 'templatewizard-insert' ), flags: [ 'primary', 'progressive' ], action: 'insert', modes: 'insert' },
	{ label: OO.ui.deferMsg( 'templatewizard-cancel' ), flags: 'safe', modes: [ 'choose', 'insert' ] }
];
mediaWiki.TemplateWizard.Dialog.prototype.getBodyHeight = function () {
	return 400;
};
mediaWiki.TemplateWizard.Dialog.prototype.initialize = function () {
	mediaWiki.TemplateWizard.Dialog.super.prototype.initialize.apply( this, arguments );

	// Set up the search form and results panel.
	this.searchForm = new mediaWiki.TemplateWizard.SearchForm( this );
	this.resultsPanel = new OO.ui.PanelLayout( { padded: true, expanded: true } );

	// Put the panels together and add to the dialog body.
	this.stack = new OO.ui.StackLayout( { items: [ this.searchForm, this.resultsPanel ], continuous: true } );
	this.$body.append( this.stack.$element );
};
mediaWiki.TemplateWizard.Dialog.prototype.setResultsPanel = function ( panelContents ) {
	this.resultsPanel.$element.html( panelContents );
};
mediaWiki.TemplateWizard.Dialog.prototype.getSetupProcess = function ( data ) {
	return mediaWiki.TemplateWizard.Dialog.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
		}, this );
};
mediaWiki.TemplateWizard.Dialog.prototype.getReadyProcess = function ( data ) {
	return mediaWiki.TemplateWizard.Dialog.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			this.actions.setMode( 'choose' );
			this.searchForm.titleSearchWidget.setValue( '' );
			this.searchForm.titleSearchWidget.focus();
		}, this );
};
mediaWiki.TemplateWizard.Dialog.prototype.getTeardownProcess = function ( data ) {
	return mediaWiki.TemplateWizard.Dialog.super.prototype.getTeardownProcess.call( this, data )
		.next( function () {
			this.setResultsPanel( '' );
		}, this );
};
mediaWiki.TemplateWizard.Dialog.prototype.getActionProcess = function ( action ) {
	var dialog = this, templateFormatter;
	if ( action === 'insert' ) {
		templateFormatter = new mediaWiki.TemplateWizard.TemplateFormatter();
		templateFormatter.setTemplateName( this.searchForm.getTemplateForm().getTitle().getMainText() );
		templateFormatter.setFormat( this.searchForm.getTemplateForm().getFormat() );
		templateFormatter.setParameters( this.searchForm.getTemplateForm().getParameters() );
		$( '#wpTextbox1' ).textSelection( 'encapsulateSelection', { post: templateFormatter.getTemplate() } );
		return new OO.ui.Process( function () {
			dialog.close( { action: action } );
		} );
	}
	// Fallback to parent handler.
	return mediaWiki.TemplateWizard.Dialog.super.prototype.getActionProcess.call( this, action );
};
