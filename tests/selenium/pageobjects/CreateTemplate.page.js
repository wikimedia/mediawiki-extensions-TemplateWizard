'use strict';

const Page = require( 'wdio-mediawiki/Page' ),
	Api = require( 'wdio-mediawiki/Api' ),
	fs = require( 'fs' ),
	path = require( 'path' );

class CreateTemplate extends Page {

	get testTemplate() { return $( '.mw-templatedata-doc-wrap' ); }

	create( testTemplateName ) {
		browser.call( function () {
			const templateWikitext = fs.readFileSync( `${path.dirname( __dirname )}/fixtures/en.Example.wikitext` );
			return Api.edit( `Template:${testTemplateName}`, templateWikitext );
		} );
	}
	open( testTemplateName ) {
		super.openTitle( `Template:${testTemplateName}` );
		this.testTemplate.waitForVisible();
	}

}

module.exports = new CreateTemplate();
