( function () {

	function enableCirrusSearchLookup( enabled ) {
		const config = mw.config.get( 'wgTemplateWizardConfig' );
		config.cirrusSearchLookup = enabled;
		mw.config.set( 'wgTemplateWizardConfig', config );
	}

	QUnit.module( 'TemplateWizard.SearchField', {
		beforeEach: function () {
			enableCirrusSearchLookup( false );
		},
		afterEach: function () {
			enableCirrusSearchLookup( false );
		}
	} );

	QUnit.test( 'default prefixsearch', function ( assert ) {
		const widget = new mw.TemplateWizard.SearchField(),
			query = 'a',
			apiParams = widget.getApiParams( query );

		assert.deepEqual( apiParams, {
			action: 'templatedata',
			generator: 'prefixsearch',
			gpssearch: 'a',
			gpsnamespace: 10,
			gpslimit: 10,
			redirects: 1,
			includeMissingTitles: 1,
			lang: 'qqx'
		} );
	} );

	QUnit.test( 'CirrusSearch: all API parameters', function ( assert ) {
		enableCirrusSearchLookup( true );
		const widget = new mw.TemplateWizard.SearchField(),
			query = 'a',
			apiParams = widget.getApiParams( query );

		assert.deepEqual( apiParams, {
			action: 'templatedata',
			generator: 'search',
			gsrsearch: 'a*',
			gsrnamespace: 10,
			gsrlimit: 10,
			gsrprop: [ 'redirecttitle' ],
			redirects: 1,
			includeMissingTitles: 1,
			lang: 'qqx'
		} );
	} );

	QUnit.test( 'CirrusSearch: prefixsearch behavior', function ( assert ) {
		enableCirrusSearchLookup( true );
		const widget = new mw.TemplateWizard.SearchField();

		[
			{
				query: 'a',
				expected: 'a*'
			},
			{
				query: 'a ',
				expected: 'a '
			},
			{
				query: 'ü',
				expected: 'ü*'
			},
			{
				query: '3',
				expected: '3*'
			},
			{
				query: '!!',
				expected: '!!'
			},
			{
				query: 'Foo:',
				expected: 'Foo:'
			},
			{
				query: 'Foo:Bar',
				expected: 'Foo:Bar*'
			},
			{
				query: 'foo_',
				expected: 'foo_'
			},
			{
				query: 'foo-',
				expected: 'foo-'
			},
			{
				query: 'foo+',
				expected: 'foo+'
			},
			{
				query: 'foo/',
				expected: 'foo/'
			},
			{
				query: 'foo~',
				expected: 'foo~'
			},
			{
				query: 'foo*',
				expected: 'foo*'
			},
			{
				query: '(foo)',
				expected: '(foo)'
			},
			{
				query: '[foo]',
				expected: '[foo]'
			},
			{
				query: '{foo}',
				expected: '{foo}'
			},
			{
				query: '"foo"',
				expected: '"foo"'
			},
			{
				query: 'foß',
				expected: 'foß*'
			},
			{
				query: '中文字',
				expected: '中文字*'
			},
			{
				query: 'zhōngwénzì',
				expected: 'zhōngwénzì*'
			}
		].forEach( function ( data ) {
			const apiParams = widget.getApiParams( data.query );

			assert.strictEqual(
				apiParams.gsrsearch,
				data.expected,
				'Searching for ' + data.query
			);
		} );
	} );

	QUnit.test( 'getLookupRequest() when CirrusSearch is not available', function ( assert ) {
		let callCount = 0;
		const api = {
				get: function () {
					callCount++;
				}
			},
			widget = new mw.TemplateWizard.SearchField( { api: api } );
		widget.getLookupRequest();
		assert.strictEqual( callCount, 1 );
	} );

	QUnit.test( 'getLookupRequest() when exact match was already found', function ( assert ) {
		enableCirrusSearchLookup( true );
		let callCount = 0;
		const api = {
				get: function () {
					callCount++;
					return {
						then: function ( callback ) {
							callback( { pages: {
								1: { title: 'DE' }
							} } );
							return {
								promise: function () { return undefined; }
							};
						}
					};
				}
			},
			widget = new mw.TemplateWizard.SearchField( { api: api } );

		widget.setValue( 'de' );
		widget.getLookupRequest();

		assert.strictEqual( callCount, 1 );
	} );

	QUnit.test( 'getLookupCacheDataFromResponse() API result conversion', function ( assert ) {
		const widget = new mw.TemplateWizard.SearchField(),
			apiResult = {
				pages: {
					2: {
						title: 'Template:Foo',
						description: 'Just a test',
						otherTemplateDataInfo: {}
					}
				}
			},
			searchResults = widget.getLookupCacheDataFromResponse( apiResult );

		assert.deepEqual( searchResults, [
			{
				data: {
					description: 'Just a test',
					otherTemplateDataInfo: {},
					title: 'Template:Foo'
				},
				description: 'Just a test',
				label: 'Foo'
			}
		] );
	} );

	QUnit.test( 'getLookupCacheDataFromResponse() limit', function ( assert ) {
		const widget = new mw.TemplateWizard.SearchField(),
			apiResult = { pages: {} };

		for ( let i = 0; i < 15; i++ ) {
			apiResult.pages[ i ] = { title: i.toString() };
		}

		const searchResult = widget.getLookupCacheDataFromResponse( apiResult );

		assert.strictEqual( searchResult.length, 10 );
	} );

	QUnit.test( 'getLookupCacheDataFromResponse() exact match first', function ( assert ) {
		const widget = new mw.TemplateWizard.SearchField(),
			apiResult = { pages: {
				1: { title: 'Template:Deutschland' },
				2: { title: 'Template:DE' }
			} };

		widget.setValue( 'de' );
		const searchResult = widget.getLookupCacheDataFromResponse( apiResult );

		assert.strictEqual( searchResult[ 0 ].label, 'DE' );
	} );

}() );
