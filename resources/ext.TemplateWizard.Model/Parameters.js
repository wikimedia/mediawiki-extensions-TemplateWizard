/**
 * A set of TemplateWizard parameters, each enabled or disabled.
 * @class
 * @mixins OO.EventEmitter
 * @constructor
 * @param {Object} parameters The initial set of parameters.
 */
mediaWiki.TemplateWizard.Model.Parameters = function mediaWikiTemplateWizardModelParameters( parameters ) {
	var model = this;
	// Mixin constructor
	OO.EventEmitter.call( this );

	// Attributes (set all to false to start with).
	this.parameters = parameters || {};
	$.each( this.parameters, function ( name, val ) { // eslint-disable-line no-unused-vars
		model.parameters[ name ] = false;
	} );
};

/* Set up. */

OO.mixinClass( mediaWiki.TemplateWizard.Model.Parameters, OO.EventEmitter );

/* Events */

/**
 * @event changeOne
 *
 * Emitted every time a parameter changes.
 *
 * @param {bool} allEnabled
 * True if all parameters are enabled, false otherwise (including if all are disabled).
 */

/**
 * @event changeAll
 *
 * Emitted every time all parameters are set to a single value.
 *
 * @param {bool} newState
 * The new value that they're set to.
 */

/**
 * @event afterChangeAll
 *
 * Emitted after all parameters are set to a single value (directly after the 'changeAll' event).
 */

/* Methods */

/**
 * Set the enabled state of a parameter.
 * @param {string} name The parameter name.
 * @param {bool} state The state to set it to.
 */
mediaWiki.TemplateWizard.Model.Parameters.prototype.setOne = function ( name, state ) {
	var allEnabled = true;
	// Don't do anything if the parameter is already in this state.
	if ( this.parameters[ name ] === state ) {
		return;
	}
	this.parameters[ name ] = state;
	$.each( this.parameters, function ( index, paramState ) {
		allEnabled = allEnabled && paramState;
	} );
	this.emit( 'changeOne', allEnabled );
};

/**
 * Set the state of all parameters and emit a changeAll event.
 * @param {bool} newState
 */
mediaWiki.TemplateWizard.Model.Parameters.prototype.setAll = function ( newState ) {
	var model = this;
	$.each( this.parameters, function ( param, existingState ) { // eslint-disable-line no-unused-vars
		model.parameters[ param ] = newState;
	} );
	this.emit( 'changeAll', newState );
	// HACK: this second event is required so that we can react to the state of all fields *after* they've all been
	// changed (if we tried to do that with changeAll, we'd not be able to guarantee if any particular event handler was
	// the last in the queue). See T194436.
	// @TODO Add this functionality to the model.
	this.emit( 'afterChangeAll' );
};
