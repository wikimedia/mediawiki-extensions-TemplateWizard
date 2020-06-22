/* Extension namespace. */
mw.TemplateWizard = {};

/** @member {string[]} List of templates that have been inserted into the page edit textarea. */
mw.TemplateWizard.insertedTemplates = [];

/**
 * Convenience wrapper for mw.track(), to log an event with EventLogging.
 *
 * @param {string} event One of "launch", "remove-template", "use-recent", "insert-template",
 * "cancel-dialog", or "save-page".
 * @param {string[]} templateNames Array of template names (without 'Template:' prefix).
 */
mw.TemplateWizard.logEvent = function ( event, templateNames ) {
	mw.track( 'event.TemplateWizard', {
		/* eslint-disable camelcase */
		action: event,
		namespace_id: mw.config.get( 'wgNamespaceNumber' ),
		page_title: mw.config.get( 'wgTitle' ),
		revision_id: mw.config.get( 'wgCurRevisionId' ),
		template_names: templateNames
		/* eslint-enable camelcase */
	} );
};
