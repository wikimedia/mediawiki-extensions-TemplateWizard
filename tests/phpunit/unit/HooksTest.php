<?php

namespace MediaWiki\Extension\TemplateWizard\Test\Unit;

use MediaWiki\Extension\TemplateWizard\Hooks;
use MediaWiki\Output\OutputPage;
use MediaWikiUnitTestCase;

/**
 * @coversDefaultClass \MediaWiki\Extension\TemplateWizard\Hooks
 */
class HooksTest extends MediaWikiUnitTestCase {

	/**
	 * @covers MediaWiki\Extension\TemplateWizard\Hooks::onEditPage__showEditForm_initial
	 */
	public function testOnEditPage__showEditForm_initial() {
		$outputPageMock = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();
		$outputPageMock->expects( $this->once() )
			->method( 'addModules' )
			->with( 'ext.TemplateWizard' );
		( new Hooks )->onEditPage__showEditForm_initial( null, $outputPageMock );
	}
}
