<?php
/**
 * @file
 */

// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

namespace MediaWiki\Extension\TemplateWizard;

use MediaWiki\Config\Config;
use MediaWiki\EditPage\EditPage;
use MediaWiki\Hook\EditPage__showEditForm_initialHook;
use MediaWiki\Output\OutputPage;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;

/**
 * Hooks for the TemplateWizard extension.
 */
class Hooks implements
	EditPage__showEditForm_initialHook,
	ResourceLoaderGetConfigVarsHook
{

	/**
	 * Add the extension's module.
	 * @link https://www.mediawiki.org/wiki/Manual:Hooks/EditPage::showEditForm:initial
	 * @param EditPage $editPage The current EditPage object.
	 * @param OutputPage $output The OutputPage object.
	 */
	public function onEditPage__showEditForm_initial(
		$editPage,
		$output
	) {
		$output->addModules( 'ext.TemplateWizard' );
	}

	/**
	 * Adds extra variables to the global config
	 *
	 * @param array &$vars Global variables object
	 * @param string $skin
	 * @param Config $config
	 */
	public function onResourceLoaderGetConfigVars( array &$vars, $skin, Config $config ): void {
		$extensionRegistry = ExtensionRegistry::getInstance();

		$vars['wgTemplateWizardConfig'] = [
			'cirrusSearchLookup' => $extensionRegistry->isLoaded( 'CirrusSearch' ),
		];
	}
}
