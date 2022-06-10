<?php
/**
 * @file
 */

namespace MediaWiki\Extension\TemplateWizard;

use EditPage;
use ExtensionRegistry;
use OutputPage;

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
	 * Adds extra variables to the global config
	 *
	 * @param array &$vars Global variables object
	 */
	public static function onResourceLoaderGetConfigVars( array &$vars ) {
		$extensionRegistry = ExtensionRegistry::getInstance();

		$vars['wgTemplateWizardConfig'] = [
			'cirrusSearchLookup' => $extensionRegistry->isLoaded( 'CirrusSearch' ),
		];
	}
}
