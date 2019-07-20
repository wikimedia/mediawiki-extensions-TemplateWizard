( function () {

	/* Extension namespace. */
	mw.TemplateWizard = {};

	/** @var {string[]} List of templates that have been inserted into the page edit textarea. */
	mw.TemplateWizard.insertedTemplates = [];

	/**
	 * Convenience wrapper for mw.track(), to log an event with EventLogging.
	 * @param {string} event One of "launch", "remove-template", "use-recent", "insert-template",
	 * "cancel-dialog", or "save-page".
	 * @param {string[]} templateNames Array of template names (without 'Template:' prefix).
	 */
	mw.TemplateWizard.logEvent = function ( event, templateNames ) {
		mw.track( 'event.TemplateWizard', {
			action: event,
			/* eslint-disable */
			namespace_id: mw.config.get( 'wgNamespaceNumber' ),
			page_title: mw.config.get( 'wgTitle' ),
			revision_id: mw.config.get( 'wgCurRevisionId' ),
			template_names: templateNames
			/* eslint-enable */
		} );
	};

	/*
	 * Add the TemplateWizard button to the WikiEditor toolbar.
	 */
	// eslint-disable-next-line no-jquery/no-global-selector
	$( '#wpTextbox1' ).on( 'wikiEditor-toolbar-doneInitialSections', function () {
		// Take the content direction from the edit textarea
		var contentDir = $( this ).css( 'direction' ),
			// Set up the TemplateWizard dialog window.
			templateWizard = new mw.TemplateWizard.Dialog();

		OO.ui.getWindowManager().addWindows( [ templateWizard ] );

		// Add the toolbar button.
		$( this ).wikiEditor( 'addToToolbar', {
			section: 'main',
			group: 'insert',
			tools: {
				'template-wizard': {
					labelMsg: 'templatewizard-dialog-title',
					oouiIcon: 'puzzle',
					type: 'button',
					action: {
						type: 'callback',
						execute: function () {
							OO.ui.getWindowManager().openWindow( 'templateWizard', { contentDir: contentDir } );
						}
					}
				}
			}
		} );
	} );

	/*
	 * Add click handler to the publish button,
	 * to log the previously-saved list of inserted template names.
	 */
	// eslint-disable-next-line no-jquery/no-global-selector
	$( '#wpSave' ).on( 'click', function () {
		if ( mw.TemplateWizard.insertedTemplates.length ) {
			mw.TemplateWizard.logEvent( 'save-page', mw.TemplateWizard.insertedTemplates );
		}
	} );

}() );
