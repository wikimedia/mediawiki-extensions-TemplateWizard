/**
 * @class
 * @constructor
 * @extends OO.ui.ButtonWidget
 * @param {Object} config
 * @param {mediaWiki.TemplateWizard.TemplateForm} templateForm
 * @param {string} param
 */
mediaWiki.TemplateWizard.ParamButton = function mediaWikiTemplateWizardParamButton( config, templateForm, param ) {
	this.templateForm = templateForm;
	this.param = param;

	// Config.
	config = $.extend( {
		icon: 'add',
		framed: false,
		flags: 'progressive'
	}, config );
	mediaWiki.TemplateWizard.ParamButton.super.call( this, config );

	// Change required fields to greyed-out and with a check icon.
	if ( config.required ) {
		this.isRequired = true;
		this.fieldVisible = true;
		this.setDisabled( true );
		this.setIcon( 'check' );
	} else {
		this.isRequired = false;
		this.fieldVisible = false;
	}
};

OO.inheritClass( mediaWiki.TemplateWizard.ParamButton, OO.ui.ButtonWidget );

mediaWiki.TemplateWizard.ParamButton.prototype.onClick = function ( e ) {
	// Call parent.
	mediaWiki.TemplateWizard.ParamButton.super.prototype.onClick.apply( this, [ e ] );
	// Don't do anything for required fields, as they can't be toggled.
	if ( this.isRequired ) {
		return;
	}
	// Other fields get toggled appropriately.
	if ( this.fieldVisible ) {
		// Remove the field.
		this.setIcon( 'add' );
		this.setFlags( { progressive: true, destructive: false } );
		this.templateForm.hideField( this.param );
		this.fieldVisible = false;
	} else {
		// Add the field.
		this.setIcon( 'subtract' );
		this.setFlags( { progressive: false, destructive: true } );
		this.templateForm.showField( this.param );
		this.fieldVisible = true;
	}
};
