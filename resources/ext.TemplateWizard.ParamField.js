/**
 * A ParamField is a FieldLayout for a template parameter's form field.
 * It can be enabled and disabled (i.e. added to and removed from the current set of active parameters)
 * but only if it's not a *required* parameter (in which case it's always enabled).
 *
 * @class
 * @constructor
 * @extends OO.ui.FieldLayout
 * @param {OO.ui.Widget} fieldWidget
 * @param {Object} config
 */
mediaWiki.TemplateWizard.ParamField = function mediaWikiTemplateWizardParamField( fieldWidget, config ) {
	config = $.extend( {
		align: 'top',
		required: false,
		enabled: false
	}, config );
	mediaWiki.TemplateWizard.ParamField.super.call( this, fieldWidget, config );
	this.enabled = config.enabled;
	this.required = config.required;
};

OO.inheritClass( mediaWiki.TemplateWizard.ParamField, OO.ui.FieldLayout );

mediaWiki.TemplateWizard.ParamField.prototype.setEnabled = function ( enabled ) {
	this.enabled = !!enabled;
};

mediaWiki.TemplateWizard.ParamField.prototype.isEnabled = function () {
	return this.enabled;
};

mediaWiki.TemplateWizard.ParamField.prototype.setRequired = function ( required ) {
	this.required = !!required;
};

mediaWiki.TemplateWizard.ParamField.prototype.isRequired = function () {
	return this.required;
};
