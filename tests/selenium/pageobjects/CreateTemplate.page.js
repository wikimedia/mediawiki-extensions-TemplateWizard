'use strict';

const Page = require( 'wdio-mediawiki/Page' ),
	Api = require( 'wdio-mediawiki/Api' ),
	fs = require( 'fs' ),
	path = require( 'path' );

class CreateTemplate extends Page {

	get testTemplate() {
		return $( '.mw-templatedata-doc-wrap' );
	}

	async create( testTemplateName ) {
		const bot = await Api.bot();
		const templateWikitext = fs.readFileSync( `${ path.dirname( __dirname ) }/fixtures/en.Example.wikitext` );
		await bot.edit( `Template:${ testTemplateName }`, templateWikitext );
	}

	async open( testTemplateName ) {
		await super.openTitle( `Template:${ testTemplateName }` );
		await this.testTemplate.waitForDisplayed();
	}

}

module.exports = new CreateTemplate();
