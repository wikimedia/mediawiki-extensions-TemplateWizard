<?php
/**
 * @file
 */

namespace MediaWiki\Extension\TemplateWizard;

use EditPage;
use OutputPage;
use ResourceLoader;

/**
 * Hooks for the TemplateWizard extension.
 */
class Hooks {

	/**
	 * Add the extension's module.
	 * @link https://www.mediawiki.org/wiki/Manual:Hooks/EditPage::showEditForm:initial
	 * @param EditPage $editPage The current EditPage object.
	 * @param OutputPage $output The OutputPage object.
	 */
	public static function onEditPageShowEditFormInitial(
		EditPage $editPage,
		OutputPage $output
	) {
		$output->addModules( 'ext.TemplateWizard' );
	}

	/**
	 * ResourceLoaderTestModules hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderTestModules
	 *
	 * @param array &$testModules The modules array to add to.
	 * @param ResourceLoader $resourceLoader The resource loader.
	 */
	public static function onResourceLoaderTestModules(
		array &$testModules, ResourceLoader $resourceLoader
	) {
		$testModules['qunit']['tests.ext.TemplateWizard' ] = [
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'TemplateWizard',
			'dependencies' => [ 'ext.TemplateWizard' ],
			'scripts' => [
				'tests/qunit/ext.TemplateWizard.test.js',
				'tests/qunit/ext.TemplateWizard.Model.Parameters.test.js'
			]
		];
	}
}
