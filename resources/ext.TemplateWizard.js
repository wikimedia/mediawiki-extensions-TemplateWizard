( function ( mw, $, OO ) {

	/* Extension namespace. */
	mediaWiki.TemplateWizard = {};

	$( '#wpTextbox1' ).on( 'wikiEditor-toolbar-doneInitialSections', function () {
		// Take the content direction from the edit textarea
		var contentDir = $( this ).css( 'direction' ),
			$popupOverlay = $( '<div>' ).addClass( 'ext-templatewizard-popupOverlay' ),
			// Set up the TemplateWizard dialog window.
			templateWizard = new mediaWiki.TemplateWizard.Dialog( { $popupOverlay: $popupOverlay } );

		$( 'body' ).append( $popupOverlay );
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
							OO.ui.getWindowManager().openWindow( 'templateWizard', { contentDir: contentDir, $popupOverlay: $popupOverlay } );
						}
					}
				}
			}
		} );
	} );

}( mediaWiki, jQuery, OO ) );
