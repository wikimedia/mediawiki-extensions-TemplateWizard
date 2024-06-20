/**
 * A ParamField is a FieldLayout for a template parameter's form field.
 *
 * @class
 * @extends OO.ui.FieldLayout
 *
 * @constructor
 * @param {OO.ui.Widget} fieldWidget
 * @param {Object} [config]
 * @param {boolean} [config.required=false] Field is required
 */
mw.TemplateWizard.ParamField = function MWTemplateWizardParamField( fieldWidget, config ) {
	config = Object.assign( {
		align: 'top',
		required: false
	}, config );
	mw.TemplateWizard.ParamField.super.call( this, fieldWidget, config );
	this.required = config.required;
};

OO.inheritClass( mw.TemplateWizard.ParamField, OO.ui.FieldLayout );

mw.TemplateWizard.ParamField.prototype.setRequired = function ( required ) {
	this.required = !!required;
};

mw.TemplateWizard.ParamField.prototype.isRequired = function () {
	return this.required;
};
