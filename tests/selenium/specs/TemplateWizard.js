'use strict';

var Api = require( 'wdio-mediawiki/Api' ),
	Util = require( 'wdio-mediawiki/Util' ),
	fs = require( 'fs' ),
	path = require( 'path' );

describe( 'TemplateWizard', function () {

	it( 'basic use of TemplateWizard', function () {
		var twButton, testTemplateName;

		// Create a test template.
		testTemplateName = Util.getTestString( 'Example ' );
		browser.call( function () {
			var templateWikitext = fs.readFileSync( path.dirname( __dirname ) + '/fixtures/en.Example.wikitext' );
			return Api.edit( 'Template:' + testTemplateName, templateWikitext );
		} );

		// Open an edit page.
		browser.url( browser.options.baseUrl + '/index.php?title=TemplateWizard_test&action=edit' );

		// Wait for the toolbar to load, then click the TemplateWizard button.
		twButton = '[rel="template-wizard"] a[role="button"]';
		browser.waitForVisible( twButton, 10000 );
		browser.click( twButton );

		// Wait for the dialog to open, and enter a search term.
		browser.waitForVisible( '#ext-templatewizard-dialog' );
		browser.click( '.ext-templatewizard-searchform input' );
		browser.setValue( '.ext-templatewizard-searchform input', testTemplateName );

		// Wait for the search results to appear.
		browser.waitForVisible( '.oo-ui-lookupElement-menu', 5000 );

		// Select the template.
		browser.click( '.oo-ui-labelElement-label=' + testTemplateName );
		browser.isExisting( '.ext-templatewizard-templatetitlebar .title' );

		// @TODO restore the failing tests here and make them pass. T211470.

		// Clean up (remove text to avoid close confirmation, and delete test template).
		browser.setValue( '#wpTextbox1', '' );
		browser.call( function () {
			Api.delete( 'Template:' + testTemplateName, 'Clean up after test.' );
		} );
	} );

} );
