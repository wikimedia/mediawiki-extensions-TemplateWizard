/**
 * @class
 * @constructor
 * @param {Object} templateData
 * @param {OBject} [config] Configuration options
 * @cfg {jQuery} [$popupOverlay] Overlay for any popups
 */
mediaWiki.TemplateWizard.TemplateForm = function mediaWikiTemplateWizardTemplateForm( templateData, config ) {
	mediaWiki.TemplateWizard.TemplateForm.parent.call( this );
	this.title = mediaWiki.Title.newFromText( templateData.title, mediaWiki.config.get( 'wgNamespaceIds' ).template );
	if ( !this.title ) {
		throw new Error( mediaWiki.message( 'templatewizard-invalid-title' ) );
	}
	this.format = templateData.format || 'inline';
	this.fields = {};
	this.templateTitleBar = null;
	this.menuContainer = null;
	this.$popupOverlay = config.$popupOverlay || this.$element;
	this.$element.html( this.getForm( templateData ).$element.addClass( 'ext-templatewizard-templateform' ) );
};

/* Setup */

OO.inheritClass( mediaWiki.TemplateWizard.TemplateForm, OO.ui.Widget );

/* Events */

/**
 * @event close
 *
 * A 'close' event is emitted when closing the template form and returning to the search form.
 */

/* Methods */

/**
 * Get the form's current title.
 * @return {string}
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.getTitle = function () {
	return this.title;
};

mediaWiki.TemplateWizard.TemplateForm.prototype.getFormat = function () {
	return this.format;
};

/**
 * Get the whole template-editing form (both the field-list left menu and the right-hand form panel).
 * @param {Object} templateData
 * @return {OO.ui.StackLayout}
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.getForm = function ( templateData ) {
	var menuLayout, groupedParams, paramsAndFields, fullLayout;

	// Title bar.
	this.templateTitleBar = new mediaWiki.TemplateWizard.TemplateTitleBar(
		this,
		this.title,
		templateData
	);

	// Menu area (two side-by-side panels).
	menuLayout = new OO.ui.MenuLayout();
	groupedParams = this.processParameters( templateData.params );
	paramsAndFields = this.getParamsAndFields( groupedParams );
	menuLayout.$menu.append( paramsAndFields.menu );
	menuLayout.$content.append( paramsAndFields.fields );
	this.menuContainer = new OO.ui.PanelLayout();
	this.menuContainer.$element
		.addClass( 'ext-templatewizard-menu' )
		.append( menuLayout.$element );

	// Put the two together.
	fullLayout = new OO.ui.PanelLayout();
	fullLayout.$element.append( this.templateTitleBar.$element, this.menuContainer.$element );
	return fullLayout;
};

/**
 * Called after the TemplateForm has been attached to the DOM.
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.afterAttached = function () {
	var titleBarHeight, addRemoveAllHeight;

	// Set the top margin of the main double-panel area to match the height of the titlebar.
	titleBarHeight = this.templateTitleBar.$element.height();
	this.menuContainer.$element.css( 'margin-top', titleBarHeight + 'px' );

	// Hide all (non-required) fields.
	this.toggleFields( false );

	// Set the bottom margin of the parameter list if there's a button there.
	if ( this.addRemoveAllButton ) {
		addRemoveAllHeight = this.addRemoveAllButton.$element.parent().height();
		this.addRemoveAllButton.$element.parent().prev().css( 'margin-bottom', addRemoveAllHeight + 'px' );
	}
};

/**
 * Event handler for the 'click' event of the trashButton in TemplateTitleBar.
 * This propagates the event upwards as a 'close' event.
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.closeForm = function () {
	this.emit( 'close' );
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

mediaWiki.TemplateWizard.TemplateForm.prototype.toggleFields = function ( show ) {
	$.each( this.fields, function ( index, field ) {
		if ( field.isRequired() ) {
			return;
		}
		field.toggle( show );
	} );
};

mediaWiki.TemplateWizard.TemplateForm.prototype.showField = function ( paramName ) {
	this.fields[ paramName ].toggle( true );
	this.fields[ paramName ].getField().focus();
};

mediaWiki.TemplateWizard.TemplateForm.prototype.hideField = function ( paramName ) {
	if ( this.fields[ paramName ].isRequired() ) {
		// Required fields are not allowed to be hidden.
		return;
	}
	this.fields[ paramName ].toggle( false );
};

/**
 * Set the focus to the top-most empty template field (or does not set any focus if there is no empty field).
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.focusTopmostField = function () {
	$.each( this.fields, function ( index, field ) {
		if ( !field.getField().getValue() ) {
			field.getField().focus();
			return false;
		}
	} );
};

/**
 * Get the parameter menu and fields list.
 * @param {Object} groupedParams
 * @return {{menu: jQuery, fields: jQuery}}
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.getParamsAndFields = function ( groupedParams ) {
	var templateForm = this,
		$paramMenu = $( '<div>' ).addClass( 'parameter-list' ),
		$paramMenuWrapper = $( '<div>' ).addClass( 'parameters' ).append( $paramMenu ),
		$fields = $( '<div>' ).addClass( 'fields' ),
		hasSuggestedOrOptional = false,
		parametersModel = new mediaWiki.TemplateWizard.Model.Parameters( $.extend( {}, groupedParams.suggested, groupedParams.optional ) );
	parametersModel.connect( templateForm, { afterChangeAll: 'focusTopmostField' } );
	$.each( groupedParams, function ( groupName, group ) {
		var paramGroupTitle,
			hasParams = false,
			$paramList = $( '<div>' ).addClass( 'parameter-list-inner' );
		$.each( group, function ( param, details ) {
			var button,
				label = param,
				description = '';
			// Description.
			if ( details.description ) {
				description = details.description;
			}
			if ( details.default ) {
				description += ' ' + mediaWiki.message( 'templatewizard-default', details.default );
			}
			if ( details.label ) {
				label = details.label;
			}
			// Button.
			button = new mediaWiki.TemplateWizard.ParamButton(
				templateForm,
				param,
				parametersModel,
				{ label: label, title: description, required: details.required }
			);
			// Form field.
			templateForm.fields[ param ] = new mediaWiki.TemplateWizard.ParamField(
				templateForm.getInputWidgetForParam( param, details ),
				{ label: label, help: description, required: details.required }
			);

			hasSuggestedOrOptional = hasSuggestedOrOptional || !details.required;
			$paramList.append( $( '<div>' ).append( button.$element ) );
			$fields.append( templateForm.fields[ param ].$element );
			hasParams = true;
		} );
		if ( hasParams ) {
			// The following messages are used here:
			// * templatewizard-parameters-required
			// * templatewizard-parameters-suggested
			// * templatewizard-parameters-optional
			paramGroupTitle = mediaWiki.message( 'templatewizard-parameters-' + groupName ).text();
			$paramMenu.append(
				$( '<span>' ).addClass( 'section-header' ).text( paramGroupTitle ),
				$paramList
			);
		}
	} );
	// Add the add/remove all fields button.
	if ( hasSuggestedOrOptional ) {
		this.addRemoveAllButton = new mediaWiki.TemplateWizard.AddRemoveAllButton( parametersModel );
		$paramMenuWrapper.append( $( '<div>' ).addClass( 'add-remove-all' ).append( this.addRemoveAllButton.$element ) );
	}
	return {
		menu: $paramMenuWrapper,
		fields: $fields
	};
};

mediaWiki.TemplateWizard.TemplateForm.prototype.getInputWidgetForParam = function ( param, paramDefinition ) {
	var widget, config = { name: param, $overlay: this.$popupOverlay };
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
	if ( paramDefinition.autovalue ) {
		// Store the autovalue as data, so we can later tell if the value differs from it.
		widget.setData( { autovalue: paramDefinition.autovalue } );
	}
	return widget;
};

mediaWiki.TemplateWizard.TemplateForm.prototype.getParameters = function () {
	var params = {};
	$.each( this.fields, function ( name, field ) {
		if ( !field.isVisible() ) {
			// Don't include hidden fields.
			return;
		}
		params[ name ] = field.getField().getValue();
	} );
	return params;
};

/**
 * Get the first field with any value.
 * @return {boolean|OO.ui.Widget}
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.getFirstFieldWithValue = function () {
	var firstValuedField = false;
	$.each( this.fields, function ( name, field ) {
		var val = field.getField().getValue(),
			data = field.getField().getData();
		// See if it's got a value and whether that value differs from the autovalue.
		if ( val &&
			( data === undefined || data.autovalue === undefined || ( data.autovalue && val !== data.autovalue ) )
		) {
			firstValuedField = field;
			// Leave the loop.
			return false;
		}
	} );
	return firstValuedField;
};

/**
 * Get the first invalid field.
 * @return {boolean|OO.ui.Widget}
 */
mediaWiki.TemplateWizard.TemplateForm.prototype.getInvalidField = function () {
	var firstInvalidWidget = false;
	$.each( this.fields, function ( name, field ) {
		var widget = field.getField();
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
