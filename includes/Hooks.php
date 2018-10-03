<?php
/**
 * @file
 */

namespace MediaWiki\Extension\TemplateWizard;

use EditPage;
use ExtensionRegistry;
use MediaWiki\MediaWikiServices;
use OutputPage;
use ResourceLoader;
use User;

/**
 * Hooks for the TemplateWizard extension.
 */
class Hooks {

	/** @var string The name of the beta-feature. */
	private static $betaFeature = 'templatewizard-betafeature';

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
		// Enable TemplateWizard if the BetaFeatures extension is not loaded,
		// or if the user has enabled it as a beta-feature.
		if (
			!ExtensionRegistry::getInstance()->isLoaded( 'BetaFeatures' )
			|| \BetaFeatures::isFeatureEnabled( $editPage->getContext()->getUser(), static::$betaFeature )
		) {
			$output->addModules( 'ext.TemplateWizard' );
		}
	}

	/**
	 * ResourceLoaderTestModules hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderTestModules
	 *
	 * @param array &$testModules The modules array to add to.
	 * @param ResourceLoader $resourceLoader The resource loader.
	 * @return bool
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
		return true;
	}

	/**
	 * Add TemplateWizard as a beta feature.
	 * @see https://www.mediawiki.org/wiki/Extension:BetaFeatures/GetBetaFeaturePreferences
	 * @param User $user
	 * @param mixed[] &$betaPrefs
	 */
	public static function onGetBetaFeaturePreferences( User $user, &$betaPrefs ) {
		$extensionAssetsPath = MediaWikiServices::getInstance()
			->getMainConfig()
			->get( 'ExtensionAssetsPath' );
		$mediawikiOrgBaseUrl = 'https://www.mediawiki.org/wiki/Special:MyLanguage/';
		$betaPrefs[static::$betaFeature ] = [
			'label-message' => 'templatewizard-betafeature-message',
			'desc-message' => 'templatewizard-betafeature-description',
			'screenshot' => [
				'ltr' => "$extensionAssetsPath/TemplateWizard/images/betafeature-ltr.svg",
				'rtl' => "$extensionAssetsPath/TemplateWizard/images/betafeature-rtl.svg",
			],
			'info-link' => $mediawikiOrgBaseUrl . 'Help:Extension:TemplateWizard',
			'discussion-link' => $mediawikiOrgBaseUrl . 'Help_talk:Extension:TemplateWizard',
		];
	}
}
