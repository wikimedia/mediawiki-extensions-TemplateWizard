/**
 * The main dialog box for the TemplateWizard.
 * @class
 * @constructor
 * @extends OO.ui.ProcessDialog
 * @param {object} config
 * @cfg {jQuery} [$popupOverlay] Overlay for popups inside the dialog
 */
mediaWiki.TemplateWizard.Dialog = function mediaWikiTemplateWizardDialog( config ) {
	mediaWiki.TemplateWizard.Dialog.super.call( this, config );

	// Instantiate with default value
	this.contentDir = 'ltr';
	this.$popupOverlay = config.$popupOverlay || this.$element;
};
OO.inheritClass( mediaWiki.TemplateWizard.Dialog, OO.ui.ProcessDialog );
mediaWiki.TemplateWizard.Dialog.static.name = 'templateWizard';
mediaWiki.TemplateWizard.Dialog.static.size = 'large';
mediaWiki.TemplateWizard.Dialog.static.title = OO.ui.deferMsg( 'templatewizard-dialog-title' );
mediaWiki.TemplateWizard.Dialog.static.actions = [
	{ label: OO.ui.deferMsg( 'templatewizard-insert' ), flags: [ 'primary', 'progressive' ], action: 'insert', modes: [ 'choose', 'insert' ] },
	{ label: OO.ui.deferMsg( 'templatewizard-cancel' ), flags: 'safe', action: 'closeDialog', modes: [ 'choose', 'insert' ] },
	{ title: OO.ui.deferMsg( 'templatewizard-close-template' ), flags: 'destructive', action: 'closeTemplate', modes: [ 'choose', 'insert' ], framed: false, icon: 'trash' }
];

/**
 * Set the height to a reasonable maximum.
 * @return {number} Body height
 */
mediaWiki.TemplateWizard.Dialog.prototype.getBodyHeight = function () {
	return 500;
};

/**
 * Show the search form.
 */
mediaWiki.TemplateWizard.Dialog.prototype.showSearchForm = function () {
	// Prevent template insertion (we know there's only one 'insert' action).
	this.getActions().get( { actions: [ 'insert' ] } )[ 0 ].setDisabled( true );
	// @TODO: When OOUI supports hidden actions, this should be made one. Until then, we hide it manually.
	this.getActions().get( { actions: [ 'closeTemplate' ] } )[ 0 ].$element.hide();

	// Keep track of whether we're ignoring fields (and closing or inserting the template),
	// along with the first invalid field and first field with any value.
	this.ignoreParamValues = false;
	this.invalidField = false;
	this.firstFieldWithValue = false;

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
	this.templateForm = new mediaWiki.TemplateWizard.TemplateForm( templateData, { $popupOverlay: this.$popupOverlay } );
	this.templateForm.connect( this, { close: 'closeTemplate' } );

	this.$body.html( this.templateForm.$element );
	this.templateForm.toggleFields( false );
	this.templateForm.afterAttached();
	this.actions.get( { actions: [ 'insert' ] } )[ 0 ].setDisabled( false );
};

/**
 * Event handler for the 'close' event of TemplateForm.
 */
mediaWiki.TemplateWizard.Dialog.prototype.closeTemplate = function () {
	this.executeAction( 'closeTemplate' );
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
			dialog.contentDir = data.contentDir || 'ltr';
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
	if ( this.firstFieldWithValue && this.currentAction === 'closeTemplate' ) {
		this.$errorsTitle.text( mediaWiki.msg( 'templatewizard-remove-template' ) );
		this.retryButton.setLabel( mediaWiki.msg( 'templatewizard-remove-template-retry' ) );
		this.dismissButton.setLabel( mediaWiki.msg( 'templatewizard-cancel' ) );
	} else if ( this.firstFieldWithValue && this.currentAction === 'closeDialog' ) {
		this.$errorsTitle.text( mediaWiki.msg( 'templatewizard-close-dialog' ) );
		this.retryButton.setLabel( mediaWiki.msg( 'templatewizard-close-dialog-retry' ) );
		this.retryButton.setFlags( 'destructive' );
		this.dismissButton.setLabel( mediaWiki.msg( 'templatewizard-cancel' ) );
	} else {
		this.retryButton.setLabel( mediaWiki.msg( 'templatewizard-invalid-values-insert' ) );
		this.dismissButton.setLabel( mediaWiki.msg( 'templatewizard-invalid-values-edit' ) );
	}
};

/**
 * Handle retry button click events. Ignores invalid fields and inserts the template anyway.
 * @param {Object} data
 * @private
 */
mediaWiki.TemplateWizard.Dialog.prototype.onRetryButtonClick = function ( data ) {
	if ( this.firstFieldWithValue && this.currentAction === 'closeTemplate' ) {
		// Change the action here so the parent's onRetryButtonClick won't execute the insert action.
		this.currentAction = 'search';
		this.showSearchForm();
	} else 	if ( this.firstFieldWithValue && this.currentAction === 'closeDialog' ) {
		this.close();
	}
	mediaWiki.TemplateWizard.Dialog.super.prototype.onRetryButtonClick.call( this, data );
	this.ignoreParamValues = true;
};

/**
 * Handle dismiss button click events.
 * Returns to editing the template, and focuses the first invalid field if there is one.
 * @param {Object} data
 * @private
 */
mediaWiki.TemplateWizard.Dialog.prototype.onDismissErrorButtonClick = function ( data ) {
	mediaWiki.TemplateWizard.Dialog.super.prototype.onDismissErrorButtonClick.call( this, data );
	this.ignoreParamValues = false;
	if ( this.invalidField ) {
		this.invalidField.focus();
		this.invalidField = false;
	}
	if ( this.firstFieldWithValue ) {
		this.firstFieldWithValue.getField().focus();
		this.firstFieldWithValue = false;
	}
};

mediaWiki.TemplateWizard.Dialog.prototype.getActionProcess = function ( action ) {
	var dialog = this;
	return mediaWiki.TemplateWizard.Dialog.super.prototype.getActionProcess.call( this, action )
		.next( function () {
			var msg;
			if ( ( action === 'closeTemplate' || action === 'closeDialog' ) && dialog.templateForm ) {
				dialog.firstFieldWithValue = dialog.templateForm.getFirstFieldWithValue();
				if ( dialog.firstFieldWithValue && !this.ignoreParamValues ) {
					msg = ( action === 'closeTemplate' ) ?
						'templatewizard-remove-template-body' :
						'templatewizard-close-dialog-body';
					return new OO.ui.Error( mediaWiki.msg( msg ) );
				}
				if ( action === 'closeTemplate' ) {
					dialog.showSearchForm();
				}
			}
			if ( action === 'closeDialog' ) {
				dialog.close();
			}
		} )
		.next( function () {
			if ( action === 'insert' && dialog.templateForm ) {
				dialog.invalidField = dialog.templateForm.getInvalidField();
				if ( dialog.invalidField && !dialog.ignoreParamValues ) {
					return new OO.ui.Error( mediaWiki.msg( 'templatewizard-invalid-values' ) );
				}
			}
		} )
		.next( function () {
			var templateFormatter, textSelectionOpts;
			if ( action === 'insert' ) {
				templateFormatter = new mediaWiki.TemplateWizard.TemplateFormatter();
				templateFormatter.setTemplateName( dialog.templateForm.getTitle().getMainText() );
				templateFormatter.setFormat( dialog.templateForm.getFormat() );
				templateFormatter.setParameters( dialog.templateForm.getParameters() );
				textSelectionOpts = {
					peri: templateFormatter.getTemplate(),
					replace: true,
					selectPeri: false
				};
				$( '#wpTextbox1' ).textSelection( 'encapsulateSelection', textSelectionOpts );
				dialog.ignoreParamValues = false;
				dialog.close();
			}
		} );
};
