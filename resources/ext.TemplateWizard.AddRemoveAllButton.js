/**
 * @class
 * @constructor
 * @extends OO.ui.ButtonWidget
 * @param {mediaWiki.TemplateWizard.Model.Parameters} model
 */
mediaWiki.TemplateWizard.AddRemoveAllButton = function mediaWikiTemplateAddRemoveAllButton( model ) {
	mediaWiki.TemplateWizard.AddRemoveAllButton.super.call( this );
	this.model = model;
	this.model.connect( this, { changeOne: 'onParametersChangeOne' } );
	this.setState( false );
};

// Inheritance.
OO.inheritClass( mediaWiki.TemplateWizard.AddRemoveAllButton, OO.ui.ButtonWidget );

/**
 * When a single parameter's enabled state is changed, see if we need to change this button.
 * @param {bool} allEnabled
 */
mediaWiki.TemplateWizard.AddRemoveAllButton.prototype.onParametersChangeOne = function ( allEnabled ) {
	this.setState( allEnabled );
};

/**
 * On clicking the button, toggle all parameters on or off and change the button's label.
 * @param {jQuery.Event} e
 */
mediaWiki.TemplateWizard.AddRemoveAllButton.prototype.onClick = function ( e ) {
	var newState;
	// Call parent.
	mediaWiki.TemplateWizard.AddRemoveAllButton.super.prototype.onClick.apply( this, [ e ] );

	// Change state.
	newState = !this.allEnabled;
	this.setState( newState );
	this.model.setAll( newState );
};

/**
 * Set the show/hide state of this button (without changing any other widget's state).
 * @param {bool} allEnabled
 */
mediaWiki.TemplateWizard.AddRemoveAllButton.prototype.setState = function ( allEnabled ) {
	if ( allEnabled ) {
		this.allEnabled = true;
		this.setLabel( mediaWiki.message( 'templatewizard-remove-all' ).text() );
	} else {
		this.allEnabled = false;
		this.setLabel( mediaWiki.message( 'templatewizard-add-all' ).text() );
	}
};

/**
 * Disconnect from the model and remove from the DOM.
 */
mediaWiki.TemplateWizard.AddRemoveAllButton.prototype.destroy = function () {
	this.model.disconnect( this );
	this.$element.remove();
};
