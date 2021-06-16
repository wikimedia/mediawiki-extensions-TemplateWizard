/**
 * Creates a mw.TemplateWizard.DismissibleMessageWidget object.
 *
 * This widget allows a user to permanently dismiss a message widget
 * {@see OO.ui.MessageWidget}. When the widget is dismissed, a flag
 * is set in the local storage. This flag will then be used to prevent
 * the widget from being shown on subsequent views.
 *
 * @class
 * @extends OO.ui.MessageWidget
 *
 * @constructor
 * @param {Object} config Configuration options
 * @cfg {mw.Message} message Message to display
 */
mw.TemplateWizard.DismissibleMessageWidget = function MWDismissibleMessageWidget( config ) {
	// Parent constructor
	mw.TemplateWizard.DismissibleMessageWidget.super.call( this, config );

	// Properties
	this.message = config.message;
	this.dismissButton = new OO.ui.ButtonWidget( {
		icon: 'close',
		framed: false
	} );

	// Initialization
	this.dismissButton
		.connect( this, { click: 'onDismissClick' } );
	this.$element
		.addClass( 'ext-templatewizard-dismissibleMessageWidget' )
		.prepend( this.dismissButton.$element );

	var $message = this.message.parseDom();
	$message.filter( 'a' ).attr( 'target', '_blank' );
	this.setLabel( $message );

	this.toggle( !mw.storage.get( this.getStorageKey() ) );
};

/* Inheritance */

OO.inheritClass( mw.TemplateWizard.DismissibleMessageWidget, OO.ui.MessageWidget );

/* Static Properties */

mw.TemplateWizard.DismissibleMessageWidget.static.storageKeyPrefix = 'mwe-templatewizard-hide-';

/* Methods */

/**
 * Generates a local storage key using both a shared prefix and
 * the message's key {@see mw.Message}.
 *
 * @return {string} The local storage key
 */
mw.TemplateWizard.DismissibleMessageWidget.prototype.getStorageKey = function () {
	return this.constructor.static.storageKeyPrefix + this.message.key;
};

/**
 * Respond to dismiss button click event.
 */
mw.TemplateWizard.DismissibleMessageWidget.prototype.onDismissClick = function () {
	mw.storage.set( this.getStorageKey(), '1' );
	this.toggle( false );
};
