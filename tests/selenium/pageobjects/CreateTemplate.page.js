import Page from 'wdio-mediawiki/Page';
import { mwbot } from 'wdio-mediawiki/Api';
import fs from 'fs';
import path from 'path';

class CreateTemplate extends Page {

	get testTemplate() {
		return $( '.mw-templatedata-doc-wrap' );
	}

	async create( testTemplateName ) {
		const bot = await mwbot();
		/* eslint-disable no-underscore-dangle */
		const __dirname = path.dirname( new URL( import.meta.url ).pathname );
		const templateWikitext = fs.readFileSync( `${ path.dirname( __dirname ) }/fixtures/en.Example.wikitext` );
		/* eslint-enable no-underscore-dangle */
		await bot.edit( `Template:${ testTemplateName }`, templateWikitext );
	}

	async open( testTemplateName ) {
		await super.openTitle( `Template:${ testTemplateName }` );
		await this.testTemplate.waitForDisplayed();
	}

}

export default new CreateTemplate();
