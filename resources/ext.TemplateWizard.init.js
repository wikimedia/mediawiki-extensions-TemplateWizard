$( () => {
	/*
	 * Add the TemplateWizard button to the WikiEditor toolbar.
	 */
	mw.hook( 'wikiEditor.toolbarReady' ).add( ( $textarea ) => {
		// Take the content direction from the edit textarea
		const contentDir = $textarea.css( 'direction' ),
			// Set up the TemplateWizard dialog window.
			templateWizard = new mw.TemplateWizard.Dialog();

		OO.ui.getWindowManager().addWindows( [ templateWizard ] );

		// Add the toolbar button.
		$textarea.wikiEditor( 'addToToolbar', {
			section: 'main',
			group: 'insert',
			tools: {
				'template-wizard': {
					label: mw.msg( 'templatewizard-dialog-title' ),
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
	$( '#wpSave' ).on( 'click', () => {
		if ( mw.TemplateWizard.insertedTemplates.length ) {
			mw.TemplateWizard.logEvent( 'save-page', mw.TemplateWizard.insertedTemplates );
		}
	} );

} );
