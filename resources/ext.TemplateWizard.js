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
	var editCount,
		editCountBucket,
		event = {
			/* eslint-disable camelcase */
			action: action,
			namespace_id: mw.config.get( 'wgNamespaceNumber' ),
			page_title: mw.config.get( 'wgTitle' ),
			revision_id: mw.config.get( 'wgCurRevisionId' ),
			template_names: templateNames
			/* eslint-enable camelcase */
		};
	if ( !mw.user.isAnon() ) {
		editCount = mw.config.get( 'wgUserEditCount' );
		if ( editCount < 11 ) {
			editCountBucket = 'under11';
		} else if ( editCount < 100 ) {
			editCountBucket = 'over10';
		} else if ( editCount < 1000 ) {
			editCountBucket = 'over100';
		} else if ( editCount < 10000 ) {
			editCountBucket = 'over1k';
		} else {
			editCountBucket = 'over10k';
		}
		$.extend( event, {
			/* eslint-disable camelcase */
			performer: {
				user_id: mw.user.getId(),
				user_edit_count: editCount,
				user_edit_count_bucket: editCountBucket
			}
			/* eslint-enable camelcase */
		} );
	}
	mw.track( 'event.TemplateWizard', event );
};
