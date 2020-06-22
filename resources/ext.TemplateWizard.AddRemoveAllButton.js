/**
 * @class
 * @constructor
 * @extends OO.ui.ButtonWidget
 *
 * @param {mw.TemplateWizard.Model.Parameters} model
 */
mw.TemplateWizard.AddRemoveAllButton = function mediaWikiTemplateAddRemoveAllButton( model ) {
	mw.TemplateWizard.AddRemoveAllButton.super.call( this );
	this.model = model;
	this.model.connect( this, { changeOne: 'onParametersChangeOne' } );
	this.setState( false );

	// Listen to any available 'click' event, including 'space' or 'enter'
	// keydown events that are equivalen to clicking.
	// The consideration is done in the parent
	this.connect( this, { click: 'toggleAction' } );
};

// Inheritance.
OO.inheritClass( mw.TemplateWizard.AddRemoveAllButton, OO.ui.ButtonWidget );

/**
 * When a single parameter's enabled state is changed, see if we need to change this button.
 *
 * @param {boolean} allEnabled
 */
mw.TemplateWizard.AddRemoveAllButton.prototype.onParametersChangeOne = function ( allEnabled ) {
	this.setState( allEnabled );
};

/**
 * Toggle all parameters on or off and change the button's label.
 */
mw.TemplateWizard.AddRemoveAllButton.prototype.toggleAction = function () {
	var newState;

	// Change state.
	newState = !this.allEnabled;
	this.setState( newState );
	this.model.setAll( newState );
};

/**
 * Set the show/hide state of this button (without changing any other widget's state).
 *
 * @param {boolean} allEnabled
 */
mw.TemplateWizard.AddRemoveAllButton.prototype.setState = function ( allEnabled ) {
	if ( allEnabled ) {
		this.allEnabled = true;
		this.setLabel( mw.message( 'templatewizard-remove-all' ).text() );
	} else {
		this.allEnabled = false;
		this.setLabel( mw.message( 'templatewizard-add-all' ).text() );
	}
};

/**
 * Disconnect from the model and remove from the DOM.
 */
mw.TemplateWizard.AddRemoveAllButton.prototype.destroy = function () {
	this.model.disconnect( this );
	this.$element.remove();
};
