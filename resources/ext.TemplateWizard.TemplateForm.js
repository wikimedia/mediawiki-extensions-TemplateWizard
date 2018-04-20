/**
 * @class
 * @constructor
 * @param {OO.ui.ProcessDialog} dialog The dialog window.
 * @param {string} title No leading 'Template:' required.
 * @param {Object} [config] Configuration options
 */
mediaWiki.TemplateWizard.TemplateForm = function mediaWikiTemplateWizardTemplateForm( dialog, title, config ) {
	OO.ui.Widget.parent.call( this, config );
	this.dialog = dialog;
	this.title = mediaWiki.Title.newFromText( title, mediaWiki.config.get( 'wgNamespaceIds' ).template );
	if ( !this.title ) {
		throw new Error( mediaWiki.message( 'templatewizard-invalid-title' ) );
	}
	this.widgets = {};
	this.$element.append( this.getHeader() );
	this.loadTemplateData();
};
OO.inheritClass( mediaWiki.TemplateWizard.TemplateForm, OO.ui.Widget );

mediaWiki.TemplateWizard.TemplateForm.prototype.getTitle = function () {
	return this.title;
};

mediaWiki.TemplateWizard.TemplateForm.prototype.getFormat = function () {
	return this.format;
};

mediaWiki.TemplateWizard.TemplateForm.prototype.getHeader = function () {
	var $link;
	$link = $( '<a>' )
		.attr( 'target', '_blank' )
		.attr( 'title', mediaWiki.message( 'templatewizard-opens-in-new-tab' ) )
		.attr( 'href', this.title.getUrl() )
		.text( this.title.getMainText() );
	return $( '<h2>' ).html( $link );
};

mediaWiki.TemplateWizard.TemplateForm.prototype.getInputWidgetForParam = function ( param, paramDefinition ) {
	var widget, config = { name: param };
	if ( paramDefinition.autovalue ) {
		config.value = paramDefinition.autovalue;
	}
	if ( paramDefinition.required ) {
		config.required = true;
	}
	if ( paramDefinition.default ) {
		config.placeholder = mediaWiki.message( 'templatewizard-placeholder-default', paramDefinition.default );
	} else if ( paramDefinition.example ) {
		config.placeholder = mediaWiki.message( 'templatewizard-placeholder-example', paramDefinition.example );
	}
	if ( paramDefinition.type === 'number' ) {
		widget = new OO.ui.NumberInputWidget( config );
	} else if ( paramDefinition.type === 'date' ) {
		widget = new mediaWiki.widgets.DateInputWidget( config );
	} else if ( paramDefinition.type === 'wiki-user-name' ) {
		widget = new mediaWiki.widgets.UserInputWidget( config );
	} else if ( paramDefinition.type === 'wiki-page-name' ) {
		widget = new mediaWiki.widgets.TitleInputWidget( config );
	} else if ( paramDefinition.type === 'wiki-file-name' ) {
		config.showImages = true;
		config.namespace = mediaWiki.config.get( 'wgNamespaceIds' ).file;
		widget = new mediaWiki.widgets.TitleInputWidget( config );
	} else if ( paramDefinition.type === 'wiki-template-name' ) {
		config.namespace = mediaWiki.config.get( 'wgNamespaceIds' ).template;
		widget = new mediaWiki.widgets.TitleInputWidget( config );
	} else {
		widget = new OO.ui.TextInputWidget( config );
	}
	return widget;
};

mediaWiki.TemplateWizard.TemplateForm.prototype.getParameterFieldsets = function ( groupedParams ) {
	var $fieldsets = $( '<div>' ),
		self = this;
	$.each( groupedParams, function ( groupName, group ) {
		// The following messages are used here:
		// * templatewizard-parameters-required
		// * templatewizard-parameters-suggested
		// * templatewizard-parameters-optional
		var fieldsetLabel = mediaWiki.message( 'templatewizard-parameters-' + groupName ).text(),
			fieldset = new OO.ui.FieldsetLayout( { label: fieldsetLabel } );
		// @TODO Move this styling into a stylesheet.
		if ( groupName === 'required' ) {
			fieldset.$label.css( 'color', '#e04006' );
		}
		if ( groupName === 'suggested' ) {
			fieldset.$label.css( 'color', '#f99d31' );
		}
		if ( groupName === 'optional' ) {
			fieldset.$label.css( 'color', '#78ab46' );
		}
		$.each( group, function ( param, details ) {
			var field, label, description;
			// Store the widgets for later value-retrieval.
			self.widgets[ param ] = self.getInputWidgetForParam( param, details );
			description = '';
			if ( details.description ) {
				description = details.description;
			}
			if ( details.default ) {
				description += ' ' + mediaWiki.message( 'templatewizard-default', details.default );
			}
			label = param;
			if ( details.label ) {
				label = details.label;
			}
			field = new OO.ui.FieldLayout( self.widgets[ param ], {
				label: label,
				help: description
			} );
			fieldset.addItems( [ field ] );
		} );
		if ( !fieldset.isEmpty() ) {
			$fieldsets.append( fieldset.$element );
		}
	} );
	return $fieldsets;
};

mediaWiki.TemplateWizard.TemplateForm.prototype.processTemplateData = function ( apiResponse ) {
	var id, templateData, description, templateDataUrl, groupedParams;
	// Get the first page's template data.
	id = $.map( apiResponse.pages, function ( _value, key ) {
		return key;
	} );
	templateData = apiResponse.pages[ id ];

	// 1. Description.
	description = '';
	if ( templateData.description ) {
		description = templateData.description;
	} else if ( templateData.missing !== undefined || templateData.notemplatedata !== undefined ) {
		templateDataUrl = 'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:TemplateData';
		// Either the template doesn't exist or doesn't have TemplateData.
		if ( templateData.missing === undefined ) {
			description = mediaWiki.message(
				'templatewizard-no-templatedata',
				templateDataUrl
			).parse();
		} else {
			description = mediaWiki.message(
				'templatewizard-template-not-found',
				this.title.getMainText(),
				templateDataUrl,
				'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:TemplateWizard'
			).parse();
		}
	}
	if ( description ) {
		this.$element.append( $( '<p>' ).append( description ) );
	}

	// 2. Parameters.
	if ( templateData.params ) {
		groupedParams = this.processParameters( templateData.params );
		this.$element.append( this.getParameterFieldsets( groupedParams ) );
	}

	// 3. Format.
	this.format = templateData.format || 'inline';
};

mediaWiki.TemplateWizard.TemplateForm.prototype.getParameters = function () {
	var params = {};
	$.each( this.widgets, function ( name, widget ) {
		// Ignore empty parameters.
		if ( !widget.getValue() ) {
			return;
		}
		params[ name ] = widget.getValue();
	} );
	return params;
};

/**
 * Get the first invalid field.
 * @return {boolean|OO.ui.Widget}
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.getInvalidField = function () {
	var firstInvalidWidget = false;
	$.each( this.widgets, function ( name, widget ) {
		// Force the widget to validate.
		widget.blur();
		// Then check it's validity.
		if ( widget.hasFlag( 'invalid' ) ) {
			firstInvalidWidget = widget;
			return false;
		}
	} );
	return firstInvalidWidget;
};

mediaWiki.TemplateWizard.TemplateForm.prototype.processParameters = function ( params ) {
	var groupedParams = {
		required: {},
		suggested: {},
		optional: {}
	};
	$.each( params, function ( param, details ) {
		if ( details.deprecated ) {
			// Don't include even a mention of a deprecated parameter.
			return;
		}
		if ( details.required ) {
			groupedParams.required[ param ] = details;
		} else if ( details.suggested ) {
			groupedParams.suggested[ param ] = details;
		} else {
			groupedParams.optional[ param ] = details;
		}
	} );
	return groupedParams;
};

/**
 *
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.loadTemplateData = function () {
	var templateForm = this;
	templateForm.dialog.pushPending();
	new mediaWiki.Api().get( {
		action: 'templatedata',
		titles: this.title.getPrefixedDb(),
		redirects: true,
		includeMissingTitles: true,
		lang: mediaWiki.config.get( 'wgUserLanguage' )
	} )
		.done( function ( apiResponse ) {
			var fieldsets = templateForm.processTemplateData( apiResponse );
			templateForm.$element.append( fieldsets );
			// Focus the first field.
			templateForm.$element.find( ':input:first' ).focus();
		} )
		.always( function () {
			templateForm.dialog.popPending();
		} );
};
