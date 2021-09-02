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
 * @cfg {string} messageKey
 */
mw.TemplateWizard.DismissibleMessageWidget = function MWDismissibleMessageWidget( config ) {
	// eslint-disable-next-line mediawiki/msg-doc
	var $label = mw.message( config.messageKey ).parseDom();
	$label.filter( 'a[href]' ).attr( 'target', '_blank' );
	// eslint-disable-next-line no-jquery/variable-pattern
	config.label = $label;

	// Parent constructor
	mw.TemplateWizard.DismissibleMessageWidget.super.call( this, config );

	// Properties
	this.messageKey = config.messageKey;

	var dismissButton = new OO.ui.ButtonWidget( {
		icon: 'close',
		framed: false,
		title: mw.msg( 'templatewizard-dismissible-message-close' )
	} )
		.connect( this, { click: 'onDismissClick' } );

	this.$element
		.addClass( 'ext-templatewizard-dismissibleMessageWidget' )
		.prepend( dismissButton.$element );

	var hidden = !!mw.storage.get( this.getStorageKey() );
	this.toggle( !hidden );
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
	return this.constructor.static.storageKeyPrefix + this.messageKey;
};

/**
 * Respond to dismiss button click event.
 *
 * @fires close
 */
mw.TemplateWizard.DismissibleMessageWidget.prototype.onDismissClick = function () {
	mw.storage.set( this.getStorageKey(), '1' );
	this.toggle( false );
	this.emit( 'close' );
};
