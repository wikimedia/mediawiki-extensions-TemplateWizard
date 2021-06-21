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

	QUnit.test( 'getLookupRequest() when CirrusSearch is not available', ( assert ) => {
		let callCount = 0;
		const api = {
				get: () => {
					callCount++;
				}
			},
			widget = new mw.TemplateWizard.SearchField( { api } );
		widget.getLookupRequest();
		assert.strictEqual( 1, callCount );
	} );

	QUnit.test( 'getLookupRequest() when exact match was already found', ( assert ) => {
		enableCirrusSearchLookup( true );
		let callCount = 0;
		const api = {
				get: () => {
					callCount++;
					return {
						then: ( callback ) => {
							callback( { pages: {
								1: { title: 'DE' }
							} } );
							return {
								promise: () => undefined
							};
						}
					};
				}
			},
			widget = new mw.TemplateWizard.SearchField( { api } );

		widget.setValue( 'de' );
		widget.getLookupRequest();

		assert.strictEqual( 1, callCount );
	} );

	QUnit.test( 'getLookupCacheDataFromResponse() API result conversion', ( assert ) => {
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

	QUnit.test( 'getLookupCacheDataFromResponse() limit', ( assert ) => {
		const widget = new mw.TemplateWizard.SearchField(),
			apiResult = { pages: {} };

		for ( let i = 0; i < 15; i++ ) {
			apiResult.pages[ i ] = { title: i.toString() };
		}

		const searchResult = widget.getLookupCacheDataFromResponse( apiResult );

		assert.strictEqual( 10, searchResult.length );
	} );

	QUnit.test( 'getLookupCacheDataFromResponse() exact match first', ( assert ) => {
		const widget = new mw.TemplateWizard.SearchField(),
			apiResult = { pages: {
				1: { title: 'Deutschland' },
				2: { title: 'DE' }
			} };

		widget.setValue( 'de' );
		const searchResult = widget.getLookupCacheDataFromResponse( apiResult );

		assert.strictEqual( 'DE', searchResult[ 0 ].label );
	} );

}() );
