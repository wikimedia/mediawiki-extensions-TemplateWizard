/**
 * @class
 * @constructor
 * @extends OO.ui.ButtonWidget
 * @param {mw.TemplateWizard.TemplateForm} templateForm
 * @param {string} param
 * @param {mw.TemplateWizard.Model.Parameters} model
 * @param {Object} config
 * @cfg {boolean} [required] Parameter is required
 */
mw.TemplateWizard.ParamButton = function MWTemplateWizardParamButton(
	templateForm, param, model, config
) {
	// Config.
	config = $.extend( {
		icon: 'add',
		framed: false,
		flags: 'progressive'
	}, config );
	mw.TemplateWizard.ParamButton.super.call( this, config );

	this.templateForm = templateForm;
	this.param = param;
	this.model = model;
	this.model.connect( this, { changeAll: 'onParametersChangeAll' } );

	// Change required fields to greyed-out and with a check icon.
	if ( config.required ) {
		this.isRequired = true;
		this.isEnabled = true;
		this.setDisabled( true );
		this.setIcon( 'check' );
		this.setTitle( mw.msg( 'templatewizard-parambutton-required-title', this.getLabel() ) );
	} else {
		this.isRequired = false;
		this.isEnabled = false;
		// For non-required fields, change the title to represent the state of the button
		// and describe the action it results in, for accessibility
		this.setTitle( mw.msg( 'templatewizard-parambutton-add-title', this.getLabel() ) );
	}

	// Listen to any available 'click' event, including 'space' or 'enter'
	// keydown events that are equivalen to clicking.
	// The consideration is done in the parent
	this.connect( this, { click: 'toggleAction' } );
};

OO.inheritClass( mw.TemplateWizard.ParamButton, OO.ui.ButtonWidget );

/**
 * @param {boolean} newState
 */
mw.TemplateWizard.ParamButton.prototype.onParametersChangeAll = function ( newState ) {
	this.setParamState( newState );
};

/**
 * Toggle the parameter's field's visibility,
 * and tell the add/remove all button to update itself accordingly.
 */
mw.TemplateWizard.ParamButton.prototype.toggleAction = function () {
	var newState;

	// Update the model, this button's state (including the associated field's visibility).
	newState = !this.isEnabled;
	this.model.setOne( this.param, newState );
	this.setParamState( newState );
};

/**
 * Set the state of this button (without changing the model).
 *
 * @param {boolean} setEnabled
 */
mw.TemplateWizard.ParamButton.prototype.setParamState = function ( setEnabled ) {
	// Don't do anything for required fields, as they can't be toggled.
	if ( this.isRequired ) {
		return;
	}
	// Other fields get toggled appropriately.
	if ( setEnabled ) {
		// Add the field.
		this.setIcon( 'subtract' );
		this.setFlags( { progressive: false, destructive: true } );
		this.templateForm.showField( this.param );
		this.setTitle( mw.msg( 'templatewizard-parambutton-remove-title', this.getLabel() ) );
		this.isEnabled = true;
	} else {
		// Remove the field.
		this.setIcon( 'add' );
		this.setFlags( { progressive: true, destructive: false } );
		this.templateForm.hideField( this.param );
		this.setTitle( mw.msg( 'templatewizard-parambutton-add-title', this.getLabel() ) );
		this.isEnabled = false;
	}
};

/**
 * Disconnect from the model and remove from the DOM.
 */
mw.TemplateWizard.ParamButton.prototype.destroy = function () {
	this.model.disconnect( this );
	this.$element.remove();
};
