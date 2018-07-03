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
mediaWiki.TemplateWizard.Dialog.static.size = 'large';
mediaWiki.TemplateWizard.Dialog.static.title = OO.ui.deferMsg( 'templatewizard-dialog-title' );
mediaWiki.TemplateWizard.Dialog.static.actions = [
	{ label: OO.ui.deferMsg( 'templatewizard-insert' ), flags: [ 'primary', 'progressive' ], action: 'insert', modes: [ 'choose', 'insert' ] },
	{ label: OO.ui.deferMsg( 'templatewizard-cancel' ), flags: 'safe', modes: [ 'choose', 'insert' ] }
];
/**
 * Override getBodyHeight to create a tall dialog relative to the screen,
 * to match what TemplateData does for its dialog.
 * @return {number} Body height
 */
mediaWiki.TemplateWizard.Dialog.prototype.getBodyHeight = function () {
	// Add the height of the window header because we don't have a footer.
	return window.innerHeight - 200 + this.$head.outerHeight( true );
};

/**
 * Show the search form, optionally with a pre-filled search value.
 */
mediaWiki.TemplateWizard.Dialog.prototype.showSearchForm = function () {
	// Prevent template insertion (we know there's only one 'insert' action).
	this.actions.get( { actions: [ 'insert' ] } )[ 0 ].setDisabled( true );

	// Keep track of whether we're ignoring invalid fields, and the first one of them (if there are any).
	this.ignoreInvalidValues = false;
	this.invalidField = false;

	// Show the search form.
	this.searchForm = new mediaWiki.TemplateWizard.SearchForm( this );
	this.actions.setMode( 'choose' );
	this.$body.html( this.searchForm.$element );
	this.searchForm.focus();
};

/**
 * Show the template form for the given templatedata.
 * @param {Object} templateData
 */
mediaWiki.TemplateWizard.Dialog.prototype.showTemplate = function ( templateData ) {
	if ( this.templateForm ) {
		this.templateForm.disconnect( this );
	}
	this.templateForm = new mediaWiki.TemplateWizard.TemplateForm( templateData );
	this.templateForm.connect( this, { close: 'showSearchForm' } );

	this.$body.html( this.templateForm.$element );
	this.templateForm.toggleFields( false );
	this.actions.get( { actions: [ 'insert' ] } )[ 0 ].setDisabled( false );
};

/**
 * Dialog set-up.
 * @param {Object} data
 * @return {OO.ui.Process}
 */
mediaWiki.TemplateWizard.Dialog.prototype.getSetupProcess = function ( data ) {
	var dialog = this;
	return mediaWiki.TemplateWizard.Dialog.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			dialog.showSearchForm();
		}, this );
};

mediaWiki.TemplateWizard.Dialog.prototype.getReadyProcess = function ( data ) {
	return mediaWiki.TemplateWizard.Dialog.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			this.actions.setMode( 'choose' );
			this.searchForm.focus();
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
			if ( action === 'insert' && dialog.templateForm ) {
				dialog.invalidField = dialog.templateForm.getInvalidField();
				if ( dialog.invalidField && !dialog.ignoreInvalidValues ) {
					return new OO.ui.Error( mediaWiki.msg( 'templatewizard-invalid-values' ) );
				}
			}
		} )
		.next( function () {
			if ( action === 'insert' ) {
				templateFormatter = new mediaWiki.TemplateWizard.TemplateFormatter();
				templateFormatter.setTemplateName( dialog.templateForm.getTitle().getMainText() );
				templateFormatter.setFormat( dialog.templateForm.getFormat() );
				templateFormatter.setParameters( dialog.templateForm.getParameters() );
				$( '#wpTextbox1' ).textSelection( 'encapsulateSelection', { post: templateFormatter.getTemplate() } );
				dialog.ignoreInvalidValues = false;
				dialog.close();
			}
		} );
};
