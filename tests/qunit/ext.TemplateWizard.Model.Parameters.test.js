( function ( mw ) {
	QUnit.module( 'TemplateWizard.Model.Parameters' );

	QUnit.test( 'setting states', function ( assert ) {
		var parameters = new mw.TemplateWizard.Model.Parameters(),
			result = null;
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

}( mediaWiki ) );
