/**
 * The main dialog box for the TemplateWizard.
 *
 * @class
 * @constructor
 * @extends OO.ui.ProcessDialog
 * @param {Object} [config]
 */
mw.TemplateWizard.Dialog = function MWTemplateWizardDialog( config ) {
	mw.TemplateWizard.Dialog.super.call( this, config );
	this.$element.addClass( 'ext-templatewizard-dialog' );

	// Instantiate with default value
	this.contentDir = 'ltr';
};
OO.inheritClass( mw.TemplateWizard.Dialog, OO.ui.ProcessDialog );
mw.TemplateWizard.Dialog.static.name = 'templateWizard';
mw.TemplateWizard.Dialog.static.size = 'large';
mw.TemplateWizard.Dialog.static.title = OO.ui.deferMsg( 'templatewizard-dialog-title' );
mw.TemplateWizard.Dialog.static.helpUrl = 'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:TemplateWizard';
mw.TemplateWizard.Dialog.static.actions = [
	{
		label: OO.ui.deferMsg( 'templatewizard-insert' ),
		flags: [ 'primary', 'progressive' ],
		action: 'insert',
		modes: [ 'choose', 'insert' ]
	},
	{
		label: OO.ui.deferMsg( 'templatewizard-cancel' ),
		flags: [ 'safe', 'close' ],
		action: 'closeDialog',
		modes: [ 'choose', 'insert' ]
	},
	{
		action: 'help',
		label: OO.ui.deferMsg( 'templatewizard-help' ),
		title: OO.ui.deferMsg( 'templatewizard-help-title' ),
		flags: [ 'progressive' ],
		modes: [ 'choose' ],
		framed: false,
		icon: 'info',
		href: mw.TemplateWizard.Dialog.static.helpUrl
	}
];

/**
 * Set the height to a reasonable maximum.
 *
 * @return {number} Body height
 */
mw.TemplateWizard.Dialog.prototype.getBodyHeight = function () {
	return 500;
};

/**
 * Show the search form.
 */
mw.TemplateWizard.Dialog.prototype.showSearchForm = function () {
	// Prevent template insertion (we know there's only one 'insert' action).
	this.getActions().get( { actions: [ 'insert' ] } )[ 0 ].setDisabled( true );

	// Keep track of whether we're ignoring fields (and closing or inserting the template),
	// along with the first invalid field and first field with any value.
	this.ignoreParamValues = false;
	this.invalidField = false;
	this.firstFieldWithValue = false;

	// Show the search form.
	this.searchForm = new mw.TemplateWizard.SearchForm( this, { contentDir: this.contentDir } );
	this.actions.setMode( 'choose' );
	this.$body.html( this.searchForm.$element );
	this.searchForm.focus();
};

/**
 * Show the template form for the given templatedata.
 *
 * @param {Object} templateData
 */
mw.TemplateWizard.Dialog.prototype.showTemplate = function ( templateData ) {
	this.actions.setMode( 'insert' );
	if ( this.templateForm ) {
		this.templateForm.disconnect( this );
	}
	this.templateForm = new mw.TemplateWizard.TemplateForm(
		templateData, { $overlay: this.$overlay }
	);
	this.templateForm.connect( this, { close: 'closeTemplate' } );

	this.$body.html( this.templateForm.$element );
	this.templateForm.afterAttached();
	this.actions.get( { actions: [ 'insert' ] } )[ 0 ].setDisabled( false );
};

/**
 * Event handler for the 'close' event of TemplateForm.
 */
mw.TemplateWizard.Dialog.prototype.closeTemplate = function () {
	this.executeAction( 'closeTemplate' );
};

/**
 * Dialog set-up.
 *
 * @param {Object} data
 * @return {OO.ui.Process}
 */
mw.TemplateWizard.Dialog.prototype.getSetupProcess = function ( data ) {
	const dialog = this;
	return mw.TemplateWizard.Dialog.super.prototype.getSetupProcess.call( this, data )
		.next( () => {
			dialog.contentDir = data.contentDir || 'ltr';
			dialog.showSearchForm();
			dialog.$element.attr( 'id', 'ext-templatewizard-dialog' );
			// Log dialog opening.
			mw.TemplateWizard.logEvent( 'launch', [] );
		}, this );
};

mw.TemplateWizard.Dialog.prototype.getReadyProcess = function ( data ) {
	return mw.TemplateWizard.Dialog.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			this.actions.setMode( 'choose' );
			this.searchForm.focus();
		}, this );
};

mw.TemplateWizard.Dialog.prototype.showErrors = function ( data ) {
	if ( this.currentAction === 'insert' ) {
		// This error is being added here rather than being returned by this.getActionProcess()
		// because of the way that insert errors are raised by failed promises, which means we can't
		// customize things. What we're doing instead is making it explicit here that any error
		// raised by insertion is an invalid-value error.
		data.push( new OO.ui.Error( mw.msg( 'templatewizard-invalid-values' ) ) );
	}
	mw.TemplateWizard.Dialog.super.prototype.showErrors.call( this, data );
	if ( this.firstFieldWithValue && this.currentAction === 'closeTemplate' ) {
		this.$errorsTitle.text( mw.msg( 'templatewizard-remove-template' ) );
		this.retryButton.setLabel( mw.msg( 'templatewizard-remove-template-retry' ) );
		this.dismissButton.setLabel( mw.msg( 'templatewizard-cancel' ) );
	} else if ( this.firstFieldWithValue && this.currentAction === 'closeDialog' ) {
		this.$errorsTitle.text( mw.msg( 'templatewizard-close-dialog' ) );
		this.retryButton.setLabel( mw.msg( 'templatewizard-close-dialog-retry' ) );
		this.retryButton.setFlags( 'destructive' );
		this.dismissButton.setLabel( mw.msg( 'templatewizard-cancel' ) );
	} else {
		this.$errorsTitle.text( mw.msg( 'ooui-dialog-process-error' ) );
		this.retryButton.setLabel( mw.msg( 'templatewizard-invalid-values-insert' ) );
		this.dismissButton.setLabel( mw.msg( 'templatewizard-invalid-values-edit' ) );
	}
};

/**
 * Handle retry button click events. Ignores invalid fields and inserts the template anyway.
 *
 * @param {Object} data
 * @private
 */
mw.TemplateWizard.Dialog.prototype.onRetryButtonClick = function ( data ) {
	if ( this.firstFieldWithValue && this.currentAction === 'closeTemplate' ) {
		// Change the action here so the parent's onRetryButtonClick
		// won't execute the insert action.
		this.currentAction = 'search';
		this.showSearchForm();
	} else if ( this.firstFieldWithValue && this.currentAction === 'closeDialog' ) {
		this.close();
	}
	mw.TemplateWizard.Dialog.super.prototype.onRetryButtonClick.call( this, data );
	this.ignoreParamValues = true;
};

/**
 * Handle dismiss button click events.
 * Returns to editing the template, and focuses the first invalid field if there is one.
 *
 * @param {Object} data
 * @private
 */
mw.TemplateWizard.Dialog.prototype.onDismissErrorButtonClick = function ( data ) {
	mw.TemplateWizard.Dialog.super.prototype.onDismissErrorButtonClick.call( this, data );
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

mw.TemplateWizard.Dialog.prototype.getActionProcess = function ( action ) {
	return mw.TemplateWizard.Dialog.super.prototype.getActionProcess.call( this, action )
		.next( () => {
			if ( ( action === 'closeTemplate' || action === 'closeDialog' ) && this.templateForm ) {
				this.firstFieldWithValue = this.templateForm.getFirstFieldWithValue();
				if ( this.firstFieldWithValue && !this.ignoreParamValues ) {
					return new OO.ui.Error( mw.msg(
						action === 'closeTemplate' ?
							'templatewizard-remove-template-body' :
							'templatewizard-close-dialog-body'
					) );
				}
				if ( action === 'closeTemplate' ) {
					mw.TemplateWizard.logEvent( 'remove-template', [ this.templateForm.getTitle().getMainText() ] );
					this.showSearchForm();
				} else {
					mw.TemplateWizard.logEvent( 'cancel-dialog', [ this.templateForm.getTitle().getMainText() ] );
				}
			}
			if ( action === 'closeDialog' ) {
				mw.TemplateWizard.logEvent( 'cancel-dialog', [] );
				this.close();
			}
			if ( action === 'help' ) {
				window.open( mw.TemplateWizard.Dialog.static.helpUrl );
			}
		} )
		.next( () => {
			if ( action === 'insert' && this.templateForm && !this.ignoreParamValues ) {
				return this.templateForm.getFieldsValidity().fail( () => {
					this.invalidField = this.templateForm.getInvalidField();
				} );
			}
		} )
		.next( () => {
			if ( action === 'insert' ) {
				const templateFormatter = new mw.TemplateWizard.TemplateFormatter();
				const templateName = this.templateForm.getTitle()
					.getRelativeText( mw.config.get( 'wgNamespaceIds' ).template );
				templateFormatter.setTemplateName( templateName );
				templateFormatter.setFormat( this.templateForm.getFormat() );
				templateFormatter.setParameters( this.templateForm.getParameters() );
				const textSelectionOpts = {
					peri: templateFormatter.getTemplate(),
					replace: true,
					selectPeri: false
				};
				// Log this insertion, and store the template name
				// for future logging when the page is saved.
				mw.TemplateWizard.logEvent( 'insert-template', [ templateName ] );
				mw.TemplateWizard.insertedTemplates.push( templateName );
				// Close dialog.
				this.ignoreParamValues = false;
				this.close().closed.then( () => {
					// Delay this until the dialog has closed, because modal dialogs make the rest
					// of the page unfocusable, and textSelection needs to focus the field to do its
					// job (T33780#8106393).
					// eslint-disable-next-line no-jquery/no-global-selector
					$( '#wpTextbox1' ).textSelection( 'encapsulateSelection', textSelectionOpts );
				} );
			}
		} );
};
