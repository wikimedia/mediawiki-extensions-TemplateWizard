/**
 * @class
 * @constructor
 * @param {mediaWiki.TemplateWizard.TemplateForm} templateForm
 * @param {mw.Title} title
 * @param {Object} templateData
 */
mediaWiki.TemplateWizard.TemplateTitleBar = function mediaWikiTemplateWizardTemplateTitleBar( templateForm, title, templateData ) {
	var $templateTitle, $description, descriptionMessage, linkButton, trashButton;
	mediaWiki.TemplateWizard.TemplateTitleBar.parent.call( this );

	// Link button.
	linkButton = new OO.ui.ButtonWidget( {
		label: '',
		flags: 'progressive',
		framed: false,
		icon: 'link',
		href: title.getUrl(),
		target: '_blank'
	} );

	// Close button.
	trashButton = new OO.ui.ButtonWidget( { label: '', flags: 'destructive', framed: false, icon: 'trash' } );
	trashButton.connect( templateForm, { click: 'closeForm' } );

	// Button group.
	this.buttons = new OO.ui.ButtonGroupWidget( { items: [ linkButton, trashButton ] } );
	this.buttons.$element.addClass( 'buttons' );

	// Template title.
	$templateTitle = $( '<p>' ).addClass( 'title' ).append( title.getMainText() );

	// Description paragraph.
	$description = $( '<p>' ).addClass( 'description' );
	if ( templateData.description ) {
		$description.text( templateData.description );
	} else if ( templateData.notemplatedata !== undefined ) {
		descriptionMessage = 'templatewizard-no-templatedata';
		$description.addClass( 'no-templatedata' );
	} else {
		descriptionMessage = 'templatewizard-no-description';
		$description.addClass( 'no-description' );
	}
	if ( descriptionMessage ) {
		$description.html(
			mediaWiki.message(
				descriptionMessage,
				title.getMainText(),
				'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:TemplateData',
				'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:TemplateWizard'
			).parse()
		);
	}

	// Put them all together.
	this.$element
		.addClass( 'ext-templatewizard-templatetitlebar' )
		.append(
			$( '<div>' ).addClass( 'title-and-buttons' ).append(
				$templateTitle,
				this.buttons.$element
			),

			$description.wrapInner( '<bdi>' )
		);
};

OO.inheritClass( mediaWiki.TemplateWizard.TemplateTitleBar, OO.ui.PanelLayout );
