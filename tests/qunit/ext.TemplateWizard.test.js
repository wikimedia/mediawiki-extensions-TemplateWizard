( function ( mw ) {
	QUnit.module( 'TemplateWizard' );

	QUnit.test( 'basic template formatting', function ( assert ) {
		var templateFormatter = new mw.TemplateWizard.TemplateFormatter();

		templateFormatter.setTemplateName( 'tl' );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tl}}' );

		templateFormatter.setTemplateName( 'tpl' );
		templateFormatter.setFormat( 'inline' );
		templateFormatter.setParameters( { key1: 'val1' } );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tpl|key1=val1}}' );

		templateFormatter.setFormat( 'block' );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tpl\n| key1 = val1\n}}' );

		templateFormatter.setParameters( { key1: 'val1', key2: 'val2' } );
		templateFormatter.setFormat( '{{_\n | ________ = _\n}}\n' );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tpl\n | key1     = val1\n | key2     = val2\n}}\n' );
	} );

	QUnit.test( 'block templates without parameters are rendered inline', function ( assert ) {
		var templateFormatter = new mw.TemplateWizard.TemplateFormatter();
		templateFormatter.setTemplateName( 'some-tag' );
		templateFormatter.setFormat( 'block' );
		assert.strictEqual( templateFormatter.getTemplate(), '{{some-tag}}' );
	} );

}( mediaWiki ) );
