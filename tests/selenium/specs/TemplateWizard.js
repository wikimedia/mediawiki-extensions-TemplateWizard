'use strict';

var Api = require( 'wdio-mediawiki/Api' ),
	Util = require( 'wdio-mediawiki/Util' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	assert = require( 'assert' );

/**
 * Assert that a given selector has x visible elements.
 * @param {string} selector
 * @param {int} count
 */
function assertVisibleElementCount( selector, count ) {
	var i,
		elements = browser.elements( selector ),
		visibleElementCount = 0;
	for ( i = 0; i < elements.value.length; i++ ) {
		if ( elements.value[ i ].isVisible() ) {
			visibleElementCount++;
		}
	}
	assert.equal( count, visibleElementCount );
}

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
		browser.url( browser.options.baseUrl + 'index.php?title=TemplateWizard_test&action=edit' );

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

		// Test that there is 1 (required) field already visible.
		assertVisibleElementCount( '.ext-templatewizard-templateform .ext-templatewizard-fields .oo-ui-fieldLayout', 1 );

		// Click "Add all fields", test that there are now 5 fields visible.
		browser.click( '.ext-templatewizard-add-remove-all a' );
		assertVisibleElementCount( '.ext-templatewizard-templateform .ext-templatewizard-fields .oo-ui-fieldLayout', 5 );

		// Add a value for Date of Birth (use 'keys()' because OOUI).
		// We don't need to click in the field first because it's the only
		// required field and it's already got focus.
		browser.keys( '2018-08-22' );

		// Remove Username, test that focus is now on Date of Death.
		browser.click( '=Username' );
		browser.hasFocus( '.ext-templatewizard-templateform .ext-templatewizard-fields .mw-widget-dateInputWidget' );

		// Try to close the dialog, test that an error is shown.
		browser.click( '=Cancel' );
		browser.waitForVisible( '.oo-ui-processDialog-errors-title' );

		// Cancel that, and try to close the template, and test that an error is shown.
		browser.click( '//div[@class="oo-ui-processDialog-errors"]//*[text()="Cancel"]' );
		browser.waitForVisible( '#ext-templatewizard-close-template-button' );
		browser.click( '#ext-templatewizard-close-template-button' );
		browser.waitForVisible( '.oo-ui-processDialog-errors-title' );

		// Cancel that, and insert the template, and test that it was inserted.
		browser.click( '//div[@class="oo-ui-processDialog-errors"]//*[text()="Cancel"]' );
		browser.click( '=Insert' );
		assert.equal( browser.getValue( '#wpTextbox1' ), '{{' + testTemplateName + '|dob=2018-08-22|photo=|dod=|citizenship=}}' );

		// Clean up (remove text to avoid close confirmation, and delete test template).
		browser.setValue( '#wpTextbox1', '' );
		browser.call( function () {
			Api.delete( 'Template:' + testTemplateName, 'Clean up after test.' );
		} );
	} );

} );
