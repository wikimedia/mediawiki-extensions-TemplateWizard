'use strict';

var Api = require( 'wdio-mediawiki/Api' ),
	Util = require( 'wdio-mediawiki/Util' ),
	fs = require( 'fs' ),
	path = require( 'path' );

describe( 'TemplateWizard search form', function () {

	it( 'basic use of the search form', function () {
		var twButton;

		// Create a test template.
		browser.call( function () {
			var templateWikitext = fs.readFileSync( path.dirname( __dirname ) + '/fixtures/en.Example.wikitext' );
			return Api.edit( Util.getTestString( 'Template:Example_' ), templateWikitext );
		} );

		// Open an edit page.
		browser.url( browser.options.baseUrl + '/index.php?title=TemplateWizard_test&action=edit' );

		// Wait for the toolbar to load, then click the TemplateWizard button.
		twButton = '[rel="template-wizard"] a[role="button"]';
		browser.waitForVisible( twButton, 5000 );
		browser.click( twButton );

		// Wait for the dialog to open, and enter a search term.
		browser.waitForVisible( '#ext-templatewizard-dialog' );
		browser.click( '.ext-templatewizard-searchform input' );
		browser.setValue( '.ext-templatewizard-searchform input', 'examp' );

		// Wait for the search results to appear.
		browser.waitForVisible( '.oo-ui-lookupElement-menu', 5000 );
	} );

} );
