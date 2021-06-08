( function () {
	QUnit.module( 'TemplateWizard' );

	QUnit.test( 'basic template formatting', function ( assert ) {
		const templateFormatter = new mw.TemplateWizard.TemplateFormatter();

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
		const templateFormatter = new mw.TemplateWizard.TemplateFormatter();
		templateFormatter.setTemplateName( 'some-tag' );
		templateFormatter.setFormat( 'block' );
		assert.strictEqual( templateFormatter.getTemplate(), '{{some-tag}}' );
	} );

	QUnit.test( 'unnamed parameters ', function ( assert ) {
		const templateFormatter = new mw.TemplateWizard.TemplateFormatter();
		templateFormatter.setTemplateName( 'tpl' );
		// Basic.
		templateFormatter.setParameters( { a: 'a', 1: 'one' } );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tpl|one|a=a}}' );
		// Multiple, in the right order.
		templateFormatter.setParameters( { a: 'a', 2: 'two', 1: 'one' } );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tpl|one|two|a=a}}' );
		// Multiple, out of order.
		templateFormatter.setParameters( { a: 'a', 1: 'one', 2: 'two' } );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tpl|one|two|a=a}}' );
		// Missing first unnamed parameter.
		templateFormatter.setParameters( { a: 'a', 2: 'two' } );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tpl||two|a=a}}' );
		// Skip one unnamed parameter.
		templateFormatter.setParameters( { a: 'a', 1: 'one', 3: 'three', b: 'b' } );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tpl|one||three|a=a|b=b}}' );
		// Block format still has the numbered params inline.
		templateFormatter.setFormat( 'block' );
		templateFormatter.setParameters( { a: 'a', 2: 'two' } );
		assert.strictEqual( templateFormatter.getTemplate(), '{{tpl||two\n| a = a\n}}' );
	} );

}() );
