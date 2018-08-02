/**
 * @class
 * @constructor
 * @extends OO.ui.ButtonWidget
 * @param {mediaWiki.TemplateWizard.TemplateForm} templateForm
 * @param {string} param
 * @param {mediaWiki.TemplateWizard.Model.Parameters} model
 * @param {Object} config
 * @cfg {boolean} [required] Parameter is required
 */
mediaWiki.TemplateWizard.ParamButton = function mediaWikiTemplateWizardParamButton( templateForm, param, model, config ) {
	// Config.
	config = $.extend( {
		icon: 'add',
		framed: false,
		flags: 'progressive'
	}, config );
	mediaWiki.TemplateWizard.ParamButton.super.call( this, config );

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
	} else {
		this.isRequired = false;
		this.isEnabled = false;
	}
};

OO.inheritClass( mediaWiki.TemplateWizard.ParamButton, OO.ui.ButtonWidget );

/**
 * @param {bool} newState
 */
mediaWiki.TemplateWizard.ParamButton.prototype.onParametersChangeAll = function ( newState ) {
	this.setParamState( newState );
};

/**
 * Clicking the button toggles this button, the parameter's field's visibility,
 * and tells the add/remove all button to update itself accordingly.
 * @param {jQuery.Event} e
 */
mediaWiki.TemplateWizard.ParamButton.prototype.onClick = function ( e ) {
	var newState;
	// Call parent.
	mediaWiki.TemplateWizard.ParamButton.super.prototype.onClick.apply( this, [ e ] );
	// Update the model, this button's state (including the associated field's visibility).
	newState = !this.isEnabled;
	this.model.setOne( this.param, newState );
	this.setParamState( newState );
};

/**
 * Set the state of this button (without changing the model).
 * @param {bool} setEnabled
 */
mediaWiki.TemplateWizard.ParamButton.prototype.setParamState = function ( setEnabled ) {
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
		this.isEnabled = true;
	} else {
		// Remove the field.
		this.setIcon( 'add' );
		this.setFlags( { progressive: true, destructive: false } );
		this.templateForm.hideField( this.param );
		this.isEnabled = false;
	}
};

/**
 * Disconnect from the model and remove from the DOM.
 */
mediaWiki.TemplateWizard.ParamButton.prototype.destroy = function () {
	this.model.disconnect( this );
	this.$element.remove();
};
