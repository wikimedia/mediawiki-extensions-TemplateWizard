'use strict';

const assert = require( 'assert' ),
	Util = require( 'wdio-mediawiki/Util' ),
	CreateTemplate = require( '../pageobjects/CreateTemplate.page' ),
	UseTemplatePage = require( '../pageobjects/UseTemplatePage.page' );

describe( 'TemplateWizard', function () {
	let testTemplateName;

	beforeEach( function () {
		// Create a test template
		testTemplateName = Util.getTestString( 'Example ' );
		CreateTemplate.create( testTemplateName );
		// Open the template page, to confirm that it's what we expect.
		CreateTemplate.open( testTemplateName );

		// Open an edit page.
		UseTemplatePage.openEdit();
		// Wait for the toolbar to load, then click the TemplateWizard button.
		UseTemplatePage.twButton.waitForDisplayed();
		UseTemplatePage.twButton.click();

		// Wait for the dialog to open, and enter a search term.
		UseTemplatePage.dialog.waitForDisplayed();
		UseTemplatePage.searchInput.click();
		$( '.ext-templatewizard-searchform input' ).setValue( testTemplateName );
		// Wait for the search results to appear.
		UseTemplatePage.searchResultMenu.waitForDisplayed( { timeout: 35000 } );

		// Select the template.
		$( `.oo-ui-labelElement-label=${testTemplateName}` ).click();
		UseTemplatePage.testTemplateTitle.isExisting();
	} );

	it( 'has 1 (required) field visible', function () {
		// Test that there is 1 (required) field already visible.
		assert.strictEqual( UseTemplatePage.visibleElementCount( '.ext-templatewizard-templateform .ext-templatewizard-fields .oo-ui-fieldLayout' ), 1 );
	} );

	it( 'has 5 fields visible', function () {
		// Click "Add all fields", test that there are now 5 fields visible.
		UseTemplatePage.addAllFields.click();
		assert.strictEqual( UseTemplatePage.visibleElementCount( '.ext-templatewizard-templateform .ext-templatewizard-fields .oo-ui-fieldLayout' ), 5 );
	} );

	it( 'has template inserted', function () {

		UseTemplatePage.addAllFields.click();

		// Add a value for Date of Birth (use 'keys()' because OOUI).
		// We don't need to click in the field first because it's the only
		// required field and it's already got focus.
		browser.keys( '2018-08-22' );

		// Remove Username, test that focus is now on Date of Death.
		UseTemplatePage.usernameField.click();
		UseTemplatePage.deathDate.isFocused();
		// Try to close the dialog, test that an error is shown.
		UseTemplatePage.cancelField.click();
		UseTemplatePage.dialogError.waitForDisplayed();

		// Cancel that, and try to close the template, and test that an error is shown.
		UseTemplatePage.dialogErrorCancelButton.click();
		UseTemplatePage.closeTemplateButton.waitForDisplayed();
		UseTemplatePage.closeTemplateButton.click();
		UseTemplatePage.dialogError.waitForDisplayed();

		// Cancel that, and insert the template, and test that it was inserted.
		UseTemplatePage.dialogErrorCancelButton.click();
		UseTemplatePage.insertField.click();
		$( '#wpTextbox1' ).waitForDisplayed();
		assert.equal( $( '#wpTextbox1' ).getValue(), `{{${testTemplateName}|dob=2018-08-22|photo=|dod=|citizenship=}}` );
	} );

} );
