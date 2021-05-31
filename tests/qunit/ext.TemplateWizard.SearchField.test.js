( function () {

	function enableCirrusSearchLookup( enabled ) {
		var config = mw.config.get( 'wgTemplateWizardConfig' );
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
		var widget = new mw.TemplateWizard.SearchField(),
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
		var widget = new mw.TemplateWizard.SearchField(),
			query = 'a',
			apiParams = widget.getApiParams( query );

		assert.deepEqual( apiParams, {
			action: 'templatedata',
			generator: 'search',
			gsrsearch: 'a*',
			gsrnamespace: 10,
			gsrlimit: 10,
			redirects: 1,
			includeMissingTitles: 1,
			lang: 'qqx'
		} );
	} );

	QUnit.test( 'CirrusSearch: prefixsearch behavior', function ( assert ) {
		enableCirrusSearchLookup( true );
		var widget = new mw.TemplateWizard.SearchField();

		[
			{
				query: 'a',
				expected: 'a*'
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
				expected: '!!*'
			}
		].forEach( function ( data ) {
			var apiParams = widget.getApiParams( data.query );

			assert.strictEqual(
				apiParams.gsrsearch,
				data.expected,
				'Searching for ' + data.query
			);
		} );
	} );

}() );
