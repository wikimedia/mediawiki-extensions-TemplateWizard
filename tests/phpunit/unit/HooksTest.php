<?php

namespace MediaWiki\Extension\TemplateWizard\Test\Unit;

use MediaWiki\Config\HashConfig;
use MediaWiki\Extension\TemplateWizard\Hooks;
use MediaWiki\Output\OutputPage;
use MediaWiki\Registration\ExtensionRegistry;
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
			->method( 'getConfig' )
			->willReturn( new HashConfig( [ 'TemplateDataEnableDiscovery' => false ] ) );
		$outputPageMock->expects( $this->once() )
			->method( 'addModules' )
			->with( 'ext.TemplateWizard' );
		ExtensionRegistry::enableForTest();
		( new Hooks( ExtensionRegistry::getInstance() ) )->onEditPage__showEditForm_initial( null, $outputPageMock );
	}
}
