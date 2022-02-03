/**
 * @class
 * @constructor
 * @param {OO.ui.ProcessDialog} dialog The dialog to attach the form to.
 * @param {Object} [config] Configuration options.
 * @cfg {string} [contentDir] The direction of the page content
 */
mw.TemplateWizard.SearchForm = function MWTemplateWizardSearchForm( dialog, config ) {
	var searchForm = this;

	config = $.extend( {
		padded: true,
		expanded: true
	}, config );
	mw.TemplateWizard.SearchForm.super.call( this, config );
	this.dialog = dialog;

	this.searchWidget = new mw.TemplateWizard.SearchField( {}, this );

	// Recent templates menu.
	this.recentTemplates = new OO.ui.MenuSelectWidget();

	// Add to the SearchForm layout.
	this.$element
		.addClass( 'ext-templatewizard-searchform' )
		.append( $( '<div>' )
			// The direction should remain the site-wide language direction
			// since the template language is assumed to be wiki language
			.css( 'direction', config.contentDir || 'ltr' )
			.append(
				this.searchWidget.$element,
				this.recentTemplates.$element
			)
		);

	// Temporary feedback message when templateSearchImprovements is true T284560
	// TODO: remove when templateSearchImprovements are out of beta
	// TODO: once removed, leave behind `mw.storage.remove( key )` for a while
	var key = 'mwe-templatewizard-hide-templatewizard-search-feedback-message';
	if ( mw.config.get( 'wgTemplateWizardConfig' ).cirrusSearchLookup && !mw.storage.get( key ) ) {
		var $label = mw.message( 'templatewizard-search-feedback-message' ).parseDom();
		$label.filter( 'a[href]' ).attr( 'target', '_blank' );

		new OO.ui.MessageWidget( {
			label: $label,
			classes: [ 'ext-templatewizard-feedback-message' ],
			showClose: true
		} )
			.on( 'close', function () {
				mw.storage.set( key, '1' );
				searchForm.focus();
			} )
			.$element.prependTo( this.$element );
	}
};

OO.inheritClass( mw.TemplateWizard.SearchForm, OO.ui.PanelLayout );

mw.TemplateWizard.SearchForm.prototype.showTemplate = function ( templateData ) {
	this.dialog.showTemplate( templateData );
	// @TODO Add to recent templates.
};

mw.TemplateWizard.SearchForm.prototype.focus = function () {
	this.searchWidget.$input.trigger( 'focus' );
};
