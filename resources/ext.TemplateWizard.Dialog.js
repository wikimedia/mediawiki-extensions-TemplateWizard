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

	// Keep track of whether we're ignoring invalid fields, and the first one of them (if there are any).
	this.ignoreInvalidValues = false;
	this.invalidField = false;

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
mediaWiki.TemplateWizard.Dialog.prototype.showErrors = function ( data ) {
	mediaWiki.TemplateWizard.Dialog.super.prototype.showErrors.call( this, data );
	this.retryButton.setLabel( mediaWiki.msg( 'templatewizard-invalid-values-insert' ) );
	this.dismissButton.setLabel( mediaWiki.msg( 'templatewizard-invalid-values-edit' ) );
};

/**
 * Handle retry button click events. Ignores invalid fields and inserts the template anyway.
 * @param {Object} data
 * @private
 */
mediaWiki.TemplateWizard.Dialog.prototype.onRetryButtonClick = function ( data ) {
	mediaWiki.TemplateWizard.Dialog.super.prototype.onRetryButtonClick.call( this, data );
	this.ignoreInvalidValues = true;
};

/**
 * Handle dismiss button click events.
 * Returns to editing the template, and focuses the first invalid field if there is one.
 * @param {Object} data
 * @private
 */
mediaWiki.TemplateWizard.Dialog.prototype.onDismissErrorButtonClick = function ( data ) {
	mediaWiki.TemplateWizard.Dialog.super.prototype.onDismissErrorButtonClick.call( this, data );
	this.ignoreInvalidValues = false;
	if ( this.invalidField ) {
		this.invalidField.focus();
		this.invalidField = false;
	}
};

mediaWiki.TemplateWizard.Dialog.prototype.getActionProcess = function ( action ) {
	var dialog = this, templateFormatter;
	return mediaWiki.TemplateWizard.Dialog.super.prototype.getActionProcess.call( this, action )
		.next( function () {
			if ( action === 'insert' && dialog.searchForm.getTemplateForm() ) {
				dialog.invalidField = dialog.searchForm.getTemplateForm().getInvalidField();
				if ( dialog.invalidField && !dialog.ignoreInvalidValues ) {
					return new OO.ui.Error( mediaWiki.msg( 'templatewizard-invalid-values' ) );
				}
			}
		} )
		.next( function () {
			if ( action === 'insert' ) {
				templateFormatter = new mediaWiki.TemplateWizard.TemplateFormatter();
				templateFormatter.setTemplateName( dialog.searchForm.getTemplateForm().getTitle().getMainText() );
				templateFormatter.setFormat( dialog.searchForm.getTemplateForm().getFormat() );
				templateFormatter.setParameters( dialog.searchForm.getTemplateForm().getParameters() );
				$( '#wpTextbox1' ).textSelection( 'encapsulateSelection', { post: templateFormatter.getTemplate() } );
				dialog.ignoreInvalidValues = false;
				dialog.close();
			}
		} );
};
