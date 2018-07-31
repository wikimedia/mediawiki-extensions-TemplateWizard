/**
 * A ParamField is a FieldLayout for a template parameter's form field.
 *
 * @class
 * @constructor
 * @extends OO.ui.FieldLayout
 * @param {OO.ui.Widget} fieldWidget
 * @param {Object} config
 * @cfg {boolean} [required] Field is required
 */
mediaWiki.TemplateWizard.ParamField = function mediaWikiTemplateWizardParamField( fieldWidget, config ) {
	config = $.extend( {
		align: 'top',
		required: false
	}, config );
	mediaWiki.TemplateWizard.ParamField.super.call( this, fieldWidget, config );
	this.required = config.required;
};

OO.inheritClass( mediaWiki.TemplateWizard.ParamField, OO.ui.FieldLayout );

mediaWiki.TemplateWizard.ParamField.prototype.setRequired = function ( required ) {
	this.required = !!required;
};

mediaWiki.TemplateWizard.ParamField.prototype.isRequired = function () {
	return this.required;
};
