'use strict';

const Page = require( 'wdio-mediawiki/Page' ),
	Api = require( 'wdio-mediawiki/Api' ),
	fs = require( 'fs' ),
	path = require( 'path' );

class CreateTemplate extends Page {

	get testTemplate() { return $( '.mw-templatedata-doc-wrap' ); }

	create( testTemplateName ) {
		browser.call( async () => {
			const bot = await Api.bot();
			const templateWikitext = fs.readFileSync( `${path.dirname( __dirname )}/fixtures/en.Example.wikitext` );
			await bot.edit( `Template:${testTemplateName}`, templateWikitext );
		} );
	}
	open( testTemplateName ) {
		super.openTitle( `Template:${testTemplateName}` );
		this.testTemplate.waitForDisplayed();
	}

}

module.exports = new CreateTemplate();
