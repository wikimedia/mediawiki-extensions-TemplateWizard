/* Extension namespace. */
mw.TemplateWizard = {};

/** @member {string[]} List of templates that have been inserted into the page edit textarea. */
mw.TemplateWizard.insertedTemplates = [];

/**
 * Convenience wrapper for mw.track(), to log an event with EventLogging.
 *
 * @param {string} action One of "launch", "remove-template", "use-recent", "insert-template",
 * "cancel-dialog", or "save-page".
 * @param {string[]} templateNames Array of template names (without 'Template:' prefix).
 */
mw.TemplateWizard.logEvent = function ( action, templateNames ) {
	var editCountBucket,
		performer,
		event = {
			/* eslint-disable camelcase */
			action: action,
			namespace_id: mw.config.get( 'wgNamespaceNumber' ),
			page_title: mw.config.get( 'wgTitle' ),
			revision_id: mw.config.get( 'wgCurRevisionId' ),
			template_names: templateNames,
			session_token: mw.user.sessionId()
			/* eslint-enable camelcase */
		};

	if ( !mw.user.isAnon() ) {
		performer = {
			// eslint-disable-next-line camelcase
			user_id: mw.user.getId()
		};

		editCountBucket = mw.config.get( 'wgUserEditCountBucket' );
		if ( editCountBucket !== null ) {
			// eslint-disable-next-line camelcase
			performer.user_edit_count_bucket = editCountBucket;
		}

		event.performer = performer;
	}

	mw.track( 'event.TemplateWizard', event );
};
