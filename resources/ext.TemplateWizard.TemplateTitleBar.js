/**
 * @class
 * @constructor
 * @param {mw.TemplateWizard.TemplateForm} templateForm
 * @param {mw.Title} title
 * @param {Object} templateData
 * @param {string|boolean} [templateData.notemplatedata]
 * @param {string} [templateData.description]
 * @param {Object<string,Object>} [templateData.params]
 */
mw.TemplateWizard.TemplateTitleBar = function MWTemplateWizardTemplateTitleBar(
	templateForm, title, templateData
) {
	mw.TemplateWizard.TemplateTitleBar.super.call( this );

	// Link button.
	const linkButton = new OO.ui.ButtonWidget( {
		label: '',
		title: mw.msg( 'templatewizard-link-to-template-title' ),
		flags: 'progressive',
		framed: false,
		icon: 'link',
		href: title.getUrl(),
		target: '_blank'
	} );

	// Close button.
	const trashButton = new OO.ui.ButtonWidget( {
		id: 'ext-templatewizard-close-template-button',
		label: '',
		flags: 'destructive',
		framed: false,
		icon: 'trash',
		title: mw.msg( 'templatewizard-remove-template-title' )
	} );
	trashButton.connect( templateForm, { click: 'closeForm' } );

	// Button group.
	this.buttons = new OO.ui.ButtonGroupWidget( { items: [ linkButton, trashButton ] } );
	this.buttons.$element.addClass( 'ext-templatewizard-buttons' );

	// Template title.
	const $templateTitle = $( '<p>' )
		.addClass( 'ext-templatewizard-title' )
		.append( title.getRelativeText( mw.config.get( 'wgNamespaceIds' ).template ) );

	// Put them all together.
	this.$element
		.addClass( 'ext-templatewizard-templatetitlebar' )
		.append(
			$( '<div>' ).addClass( 'ext-templatewizard-title-and-buttons' ).append(
				$templateTitle,
				this.buttons.$element
			),
			this.getDescriptionElement( templateData )
		);
};

OO.inheritClass( mw.TemplateWizard.TemplateTitleBar, OO.ui.PanelLayout );

/**
 * Get the description div element, which may contain zero to two paragraphs.
 *
 * @param {Object} templateData
 * @param {string|boolean} [templateData.notemplatedata]
 * @param {string} [templateData.description]
 * @param {Object<string,Object>} [templateData.params]
 * @return {jQuery}
 */
mw.TemplateWizard.TemplateTitleBar.prototype.getDescriptionElement = function ( templateData ) {
	let message;

	// Description div (may contain multiple paragraphs).
	const $description = $( '<div>' ).addClass( 'ext-templatewizard-description' );
	if ( templateData.description ) {
		// Normal description, from TemplateData.
		$description.append( $( '<p>' ).wrapInner( '<bdi>' ).text( templateData.description ) );
	} else {
		// No description. This notice may be overruled by one of the messages below.
		message = 'templatewizard-no-description';
	}

	// Add notice message where applicable. Note that a template that
	// doesn't have templatedata may still have parameters because they're
	// being guessed from the template wikitext.
	const hasTemplateData = ( templateData.notemplatedata === undefined );
	const hasParams = (
		templateData.params !== undefined &&
		Object.keys( templateData.params ).length > 0
	);
	if ( !hasParams ) {
		message = hasTemplateData ? 'templatewizard-no-params-with-td' : 'templatewizard-no-params-without-td';
	} else if ( !hasTemplateData ) {
		message = 'templatewizard-no-templatedata';
	}
	// Add the message if required. If no message is defined,
	// there will have been a template-provided description already appended.
	if ( message ) {
		$description.append(
			$( '<p>' )
				.addClass( !hasTemplateData ? 'ext-templatewizard-notice' : '' )
				.html(
					// The following messages are used here:
					// * templatewizard-no-params-without-td
					// * templatewizard-no-params-with-td
					// * templatewizard-no-templatedata
					mw.message(
						message,
						'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:TemplateData'
					).parse()
				)
				.wrapInner( '<bdi>' )
		);
	}
	return $description;
};
