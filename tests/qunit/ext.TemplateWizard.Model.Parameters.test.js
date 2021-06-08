( function () {
	QUnit.module( 'TemplateWizard.Model.Parameters' );

	QUnit.test( 'setting states', function ( assert ) {
		const parameters = new mw.TemplateWizard.Model.Parameters();
		let result = null;
		// Register event handler for testing purposes.
		parameters.on( 'changeOne', function ( allEnabled ) {
			result = allEnabled;
		} );

		// Add a non-selected parameter.
		parameters.setOne( 'param1', false );
		assert.strictEqual( result, false );

		// Change it to selected.
		parameters.setOne( 'param1', true );
		assert.strictEqual( result, true );

		// Add a 2nd parameter, matching the 1st's state.
		parameters.setOne( 'param2', true );
		assert.strictEqual( result, true );

		// Change the 1st param.
		parameters.setOne( 'param1', false );
		assert.strictEqual( result, false );

		// Finally, change the 2nd param also.
		parameters.setOne( 'param2', false );
		assert.strictEqual( result, false );
	} );

	QUnit.test( 'able to do something after changing all', function ( assert ) {
		const parameters = new mw.TemplateWizard.Model.Parameters(),
			events = [];
		// Register event handlers for testing purposes.
		parameters.on( 'changeAll', function ( newState ) {
			// Change the result here to something different to below in afterChangeAll,
			// so we can make sure the latter takes precedence.
			events.push( 'changeAll: ' + newState );
		} );
		parameters.on( 'afterChangeAll', function () {
			events.push( 'afterChangeAll' );
		} );

		// Add a bunch of parameters, and enable them.
		parameters.setOne( 'param1', false );
		parameters.setOne( 'param2', false );
		parameters.setOne( 'param3', false );
		assert.deepEqual( events, [] );

		// Enable one and then all, and ensure our test result is as expected.
		parameters.setOne( 'param2', true );
		parameters.setAll( true );
		assert.deepEqual( events, [
			'changeAll: true',
			'afterChangeAll'
		] );
	} );

}() );
