( function ( mw, $, OO ) {

	/* Extension namespace. */
	mediaWiki.TemplateWizard = {};

	$( '#wpTextbox1' ).on( 'wikiEditor-toolbar-doneInitialSections', function () {
		// Set up the TemplateWizard dialog window.
		var templateWizard = new mediaWiki.TemplateWizard.Dialog();
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
							OO.ui.getWindowManager().openWindow( 'templateWizard' );
						}
					}
				}
			}
		} );
	} );

}( mediaWiki, jQuery, OO ) );
