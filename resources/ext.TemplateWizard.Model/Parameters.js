/**
 * A set of TemplateWizard parameters, each enabled or disabled.
 *
 * @class
 * @mixes OO.EventEmitter
 * @constructor
 * @param {Object<string,Object>} parameters The initial set of parameters.
 */
mw.TemplateWizard.Model.Parameters = function MWTemplateWizardModelParameters( parameters ) {
	var name;
	// Mixin constructor
	OO.EventEmitter.call( this );

	// Attributes (set all to false to start with).
	this.parameters = parameters || {};
	for ( name in this.parameters ) {
		this.parameters[ name ] = false;
	}
};

/* Set up. */

OO.mixinClass( mw.TemplateWizard.Model.Parameters, OO.EventEmitter );

/* Events */

/**
 * @event changeOne
 *
 * Emitted every time a parameter changes.
 *
 * @param {boolean} allEnabled
 * True if all parameters are enabled, false otherwise (including if all are disabled).
 */

/**
 * @event changeAll
 *
 * Emitted every time all parameters are set to a single value.
 *
 * @param {boolean} newState
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
 *
 * @param {string} name The parameter name.
 * @param {boolean} state The state to set it to.
 */
mw.TemplateWizard.Model.Parameters.prototype.setOne = function ( name, state ) {
	var allEnabled,
		parameters = this.parameters;
	// Don't do anything if the parameter is already in this state.
	if ( parameters[ name ] === state ) {
		return;
	}
	parameters[ name ] = state;
	allEnabled = Object.keys( parameters ).every( function ( n ) {
		return parameters[ n ];
	} );
	this.emit( 'changeOne', allEnabled );
};

/**
 * Set the state of all parameters and emit a changeAll event.
 *
 * @param {boolean} newState
 */
mw.TemplateWizard.Model.Parameters.prototype.setAll = function ( newState ) {
	var name;
	for ( name in this.parameters ) {
		this.parameters[ name ] = newState;
	}
	this.emit( 'changeAll', newState );
	// HACK: this second event is required so that we can react to the
	// state of all fields *after* they've all been changed
	// (if we tried to do that with changeAll, we'd not be able to guarantee
	// if any particular event handler was the last in the queue). See T194436.
	// @TODO Add this functionality to the model.
	this.emit( 'afterChangeAll' );
};
