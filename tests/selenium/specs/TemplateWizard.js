'use strict';

const assert = require( 'assert' ),
	Util = require( 'wdio-mediawiki/Util' ),
	CreateTemplate = require( '../pageobjects/CreateTemplate.page' ),
	UseTemplatePage = require( '../pageobjects/UseTemplatePage.page' );

describe( 'TemplateWizard', () => {
	let testTemplateName;

	beforeEach( async () => {
		// Create a test template
		testTemplateName = Util.getTestString( 'Example ' );
		await CreateTemplate.create( testTemplateName );
		// Open the template page, to confirm that it's what we expect.
		await CreateTemplate.open( testTemplateName );

		// Open an edit page.
		await UseTemplatePage.openEdit();
		// Wait for the toolbar to load, then click the TemplateWizard button.
		await UseTemplatePage.twButton.waitForDisplayed();
		await UseTemplatePage.twButton.click();

		// Wait for the dialog to open, and enter a search term.
		await UseTemplatePage.dialog.waitForDisplayed();
		await UseTemplatePage.searchInput.click();
		await $( '.ext-templatewizard-searchform input' ).setValue( testTemplateName );
		// Wait for the search results to appear.
		await UseTemplatePage.searchResultMenu.waitForDisplayed( { timeout: 35000 } );

		// Select the template.
		await $( `.oo-ui-labelElement-label=${ testTemplateName }` ).click();
		await UseTemplatePage.testTemplateTitle.isExisting();
	} );

	it( 'has 1 (required) field visible', async () => {
		// Test that there is 1 (required) field already visible.
		assert.strictEqual( await UseTemplatePage.visibleElementCount( '.ext-templatewizard-templateform .ext-templatewizard-fields .oo-ui-fieldLayout' ), 1 );
	} );

	it( 'has 5 fields visible', async () => {
		// Click "Add all fields", test that there are now 5 fields visible.
		await UseTemplatePage.addAllFields.click();
		assert.strictEqual( await UseTemplatePage.visibleElementCount( '.ext-templatewizard-templateform .ext-templatewizard-fields .oo-ui-fieldLayout' ), 5 );
	} );

	it( 'has template inserted', async () => {

		await UseTemplatePage.addAllFields.click();

		// Add a value for Date of Birth (use 'keys()' because OOUI).
		// We don't need to click in the field first because it's the only
		// required field and it's already got focus.
		browser.keys( '2018-08-22' );

		// Remove Username, test that focus is now on Date of Death.
		await UseTemplatePage.usernameField.click();
		await UseTemplatePage.deathDate.isFocused();
		// Try to close the dialog, test that an error is shown.
		await UseTemplatePage.cancelField.click();
		await UseTemplatePage.dialogError.waitForDisplayed();

		// Cancel that, and try to close the template, and test that an error is shown.
		await UseTemplatePage.dialogErrorCancelButton.click();
		await UseTemplatePage.closeTemplateButton.waitForDisplayed();
		await UseTemplatePage.closeTemplateButton.click();
		await UseTemplatePage.dialogError.waitForDisplayed();

		// Cancel that, and insert the template, and test that it was inserted.
		await UseTemplatePage.dialogErrorCancelButton.click();
		await UseTemplatePage.insertField.click();
		await $( '#wpTextbox1' ).waitForDisplayed();
		await browser.waitUntil( async () => !( await UseTemplatePage.dialog.isDisplayed() ) );
		assert.equal( await $( '#wpTextbox1' ).getValue(), `{{${ testTemplateName }|dob=2018-08-22|dod=|photo=|citizenship=}}` );
	} );

} );
