'use strict';

const Page = require( 'wdio-mediawiki/Page' );

class UseTemplatePage extends Page {

	get twButton() { return $( '[rel="template-wizard"] a[role="button"]' ); }
	get dialog() { return $( '#ext-templatewizard-dialog' ); }
	get searchInput() { return $( '.oo-ui-comboBoxInputWidget-field' ); }
	get searchResultMenu() { return $( '.oo-ui-menuOptionWidget' ); }
	get testTemplateTitle() { return $( '.ext-templatewizard-templatetitlebar' ); }
	get addAllFields() { return $( '.ext-templatewizard-add-remove-all a' ); }
	get usernameField() { return $( '=Username' ); }
	get deathDate() { return $( 'input[name="dod"]' ); }
	get cancelField() { return $( '.oo-ui-icon-close' ); }
	get dialogError() { return $( '.oo-ui-processDialog-errors-title' ); }
	get dialogErrorCancelButton() { return $( '//div[@class="oo-ui-processDialog-errors"]//*[text()="Cancel"]' ); }
	get closeTemplateButton() { return $( '#ext-templatewizard-close-template-button' ); }
	get insertField() { return $( '=Insert' ); }

	openEdit() {
		super.openTitle( 'TemplateWizard_test', { action: 'edit' } );
	}
	visibleElementCount( selector ) {
		const elements = $$( selector ),
			visibleElements = elements.filter( ( element ) => element.isDisplayed() );
		return visibleElements.length;
	}

}

module.exports = new UseTemplatePage();
