/**
 * @class
 * @constructor
 * @param {Object} templateData
 * @param {string|boolean} [templateData.notemplatedata]
 * @param {string} templateData.title
 * @param {string} [templateData.description]
 * @param {string} [templateData.format]
 * @param {Object<string,Object>} [templateData.params]
 * @param {Object} [config] Configuration options
 */
mw.TemplateWizard.TemplateForm = function MWTemplateWizardTemplateForm( templateData, config ) {
	mw.TemplateWizard.TemplateForm.super.call( this );
	this.title = mw.Title.newFromText( templateData.title, mw.config.get( 'wgNamespaceIds' ).template );
	if ( !this.title ) {
		throw new Error( mw.message( 'templatewizard-invalid-title' ) );
	}
	this.format = templateData.format || 'inline';
	this.fields = [];
	this.invalidField = null;
	this.templateTitleBar = null;
	this.menuContainer = null;
	this.$overlay = config.$overlay || OO.ui.getDefaultOverlay();
	this.$element.html( this.getForm( templateData ).$element.addClass( 'ext-templatewizard-templateform' ) );

	/**
	 * Fired on initialization of TemplateForm
	 *
	 * Allowing extensions to customize or initalize the template form.
	 *
	 * @event ext_TemplateWizard_TemplateForm_init
	 * @member mw.hook
	 * @param {mw.TemplateWizard.TemplateForm} templateForm the invoking TemplateForm instance
	 * @param {Object} templateData The TempldateData of the relevant template containing
	 *  the template metadata
	 */
	mw.hook( 'ext.TemplateWizard.TemplateForm.init' ).fire( this, templateData );
};

/* Setup */

OO.inheritClass( mw.TemplateWizard.TemplateForm, OO.ui.Widget );

/* Methods */

/**
 * Get the form's current title.
 *
 * @return {string}
 */
mw.TemplateWizard.TemplateForm.prototype.getTitle = function () {
	return this.title;
};

mw.TemplateWizard.TemplateForm.prototype.getFormat = function () {
	return this.format;
};

/**
 * Get the whole template-editing form
 * (both the field-list left menu and the right-hand form panel).
 *
 * @param {Object} templateData
 * @param {string|boolean} [templateData.notemplatedata]
 * @param {string} [templateData.description]
 * @param {Object<string,Object>} [templateData.params]
 * @return {OO.ui.StackLayout}
 */
mw.TemplateWizard.TemplateForm.prototype.getForm = function ( templateData ) {
	// Title bar.
	this.templateTitleBar = new mw.TemplateWizard.TemplateTitleBar(
		this.title,
		templateData
	);

	// Menu area (two side-by-side panels).
	const menuLayout = new OO.ui.MenuLayout();
	const groupedParams = this.processParameters( templateData );
	const paramsAndFields = this.getParamsAndFields( groupedParams );
	menuLayout.$menu.append( paramsAndFields.menu );
	menuLayout.$content.append( paramsAndFields.fields );
	this.menuContainer = new OO.ui.PanelLayout();
	this.menuContainer.$element
		.addClass( 'ext-templatewizard-menu' )
		.append( menuLayout.$element );

	// Put the two together.
	const fullLayout = new OO.ui.PanelLayout();
	fullLayout.$element.append( this.templateTitleBar.$element, this.menuContainer.$element );
	return fullLayout;
};

/**
 * Called after the TemplateForm has been attached to the DOM.
 */
mw.TemplateWizard.TemplateForm.prototype.afterAttached = function () {
	// Set the top margin of the main double-panel area to match the height of the titlebar.
	const titleBarHeight = this.templateTitleBar.$element.height();
	this.menuContainer.$element.css( 'margin-top', titleBarHeight + 'px' );

	// Hide all (non-required) fields.
	this.toggleFields( false );

	// Set the bottom margin of the parameter list if there's a button there.
	if ( this.addRemoveAllButton ) {
		const addRemoveAllHeight = this.addRemoveAllButton.$element.parent().height();
		this.addRemoveAllButton.$element.parent().prev().css( 'margin-bottom', addRemoveAllHeight + 'px' );
	}

	// Set the initial focus on the first focusable, or on the 'add all' button
	this.attemptFocus();
};

/**
 * Attempt to move the focus either to the first existing selected field
 * or to the select/remove all button, if it exists, or fail gracefully if not.
 */
mw.TemplateWizard.TemplateForm.prototype.attemptFocus = function () {
	if ( !this.focusTopmostField() ) {
		// Only focus on add/remove all button if we didn't find a field
		// And the button is visible at all. It might not be visible
		// If there are no fields in the template, or if all fields
		// are required.
		if ( this.addRemoveAllButton && this.addRemoveAllButton.isVisible() ) {
			this.addRemoveAllButton.focus();
		}
	}

};

mw.TemplateWizard.TemplateForm.prototype.toggleFields = function ( show ) {
	for ( let i = 0; i < this.fields.length; i++ ) {
		const field = this.fields[ i ];
		if ( field.isRequired() ) {
			continue;
		}
		field.toggle( show );
	}
};

mw.TemplateWizard.TemplateForm.prototype.showField = function ( paramName ) {
	this.findField( paramName ).toggle( true )
		.getField().focus();
};

/**
 * Hide the form field for the given parameter,
 * and set the focus to the next or previous field if possible.
 *
 * @param {string} paramName
 */
mw.TemplateWizard.TemplateForm.prototype.hideField = function ( paramName ) {
	if ( this.findField( paramName ).isRequired() ) {
		// Required fields are not allowed to be hidden.
		return;
	}
	this.findField( paramName ).toggle( false );

	// Move the focus away from the button just clicked.
	this.attemptFocus();
};

/**
 * Set the focus to the top-most empty template field
 * (or does not set any focus if there is no empty field).
 *
 * @return {boolean} True if a field was found to focus, false otherwise.
 */
mw.TemplateWizard.TemplateForm.prototype.focusTopmostField = function () {
	// We're not using OO.ui.findFocusable() here because of wanting to limit to empty fields.
	for ( let i = 0; i < this.fields.length; i++ ) {
		const field = this.fields[ i ];
		// Focus this field if it's visible and empty, and leave the loop.
		if ( field.isVisible() && !field.getField().getValue() ) {
			field.getField().focus();
			return true;
		}
	}
	return false;
};

/**
 * Get the parameter menu and fields list.
 *
 * @param {{required:Object<string,Object>,suggested:Object<string,Object>,optional:Object<string,Object>}} groupedParams
 * @return {{menu: jQuery, fields: jQuery}}
 */
mw.TemplateWizard.TemplateForm.prototype.getParamsAndFields = function ( groupedParams ) {
	const templateForm = this,
		$paramMenu = $( '<div>' ).addClass( 'ext-templatewizard-parameter-list' ),
		$paramMenuWrapper = $( '<div>' ).addClass( 'ext-templatewizard-parameters' ).append( $paramMenu ),
		$fields = $( '<div>' ).addClass( 'ext-templatewizard-fields' );
	let hasSuggestedOrOptional = false;
	const parametersModel = new mw.TemplateWizard.Model.Parameters(
		Object.assign( {}, groupedParams.suggested, groupedParams.optional )
	);
	parametersModel.connect( templateForm, { afterChangeAll: 'attemptFocus' } );
	Object.keys( groupedParams ).forEach( ( groupName ) => {
		let hasParams = false;
		const group = groupedParams[ groupName ],
			$paramList = $( '<div>' ).addClass( 'ext-templatewizard-parameter-list-inner' );
		Object.keys( group ).forEach( ( param ) => {
			const details = group[ param ];
			let label = param,
				description = '';
			// Description.
			if ( details.description ) {
				description = details.description;
			}
			if ( details.default ) {
				description += ' ' + mw.message( 'templatewizard-default', details.default );
			}
			if ( details.label ) {
				label = details.label;
			}
			// Button.
			const button = new mw.TemplateWizard.ParamButton(
				templateForm,
				param,
				parametersModel,
				{ label: label, title: description, required: details.required }
			);

			// Form field.
			templateForm.fields.push( new mw.TemplateWizard.ParamField(
				templateForm.getInputWidgetForParam( param, details ),
				{
					label: label,
					help: description,
					required: details.required,
					data: { name: param },
					$overlay: templateForm.$overlay
				}
			) );

			/**
			 * Fired on initialization of TemplateForm
			 *
			 * This hook is fired just after creation of a parameter's button and field,
			 * before they have been added to the DOM. Extending modules can modify
			 * either as required.
			 *
			 * @event ext_TemplateWizard_field_create
			 * @member mw.hook
			 * @param {string} param name of the parameter
			 * @param {Object} details The TempldateData of the relevant template
			 *  containing the template metadata
			 * @param {mw.TemplateWizard.ParamButton} button to add the parameter
			 * @param {mw.TemplateWizard.ParamField} field to manipulate and set the
			 *  content of parameter containing the template metadata
			 */
			mw.hook( 'ext.TemplateWizard.field.create' ).fire( param, details, button, templateForm.findField( param ) );

			hasSuggestedOrOptional = hasSuggestedOrOptional || !details.required;
			$paramList.append( $( '<div>' ).append( button.$element ) );
			$fields.append( templateForm.findField( param ).$element );
			hasParams = true;
		} );
		if ( hasParams ) {
			// The following messages are used here:
			// * templatewizard-parameters-required
			// * templatewizard-parameters-suggested
			// * templatewizard-parameters-optional
			const paramGroupTitle = mw.message( 'templatewizard-parameters-' + groupName ).text();
			$paramMenu.append(
				$( '<span>' ).addClass( 'ext-templatewizard-section-header' ).text( paramGroupTitle ),
				$paramList
			);
		}
	} );
	// Add the add/remove all fields button.
	if ( hasSuggestedOrOptional ) {
		this.addRemoveAllButton = new mw.TemplateWizard.AddRemoveAllButton( parametersModel );
		$paramMenuWrapper.append( $( '<div>' ).addClass( 'ext-templatewizard-add-remove-all' ).append( this.addRemoveAllButton.$element ) );
	}
	return {
		menu: $paramMenuWrapper,
		fields: $fields
	};
};

mw.TemplateWizard.TemplateForm.prototype.getInputWidgetForParam = function (
	param, paramDefinition
) {
	let widget;
	const config = { name: param, $overlay: this.$overlay };
	if ( paramDefinition.autovalue ) {
		config.value = paramDefinition.autovalue;
	}
	if ( paramDefinition.required ) {
		config.required = true;
	}
	if ( paramDefinition.default ) {
		config.placeholder = mw.message( 'templatewizard-placeholder-default', paramDefinition.default );
	} else if ( paramDefinition.example ) {
		config.placeholder = mw.message( 'templatewizard-placeholder-example', paramDefinition.example );
	}
	if ( paramDefinition.type === 'number' ) {
		widget = new OO.ui.NumberInputWidget( config );
	} else if ( paramDefinition.type === 'date' ) {
		widget = new mw.widgets.DateInputWidget( config );
	} else if ( paramDefinition.type === 'wiki-user-name' ) {
		widget = new mw.widgets.UserInputWidget( config );
	} else if ( paramDefinition.type === 'wiki-page-name' ) {
		widget = new mw.widgets.TitleInputWidget( config );
	} else if ( paramDefinition.type === 'wiki-file-name' ) {
		config.showImages = true;
		config.namespace = mw.config.get( 'wgNamespaceIds' ).file;
		widget = new mw.widgets.TitleInputWidget( config );
	} else if ( paramDefinition.type === 'wiki-template-name' ) {
		config.namespace = mw.config.get( 'wgNamespaceIds' ).template;
		widget = new mw.widgets.TitleInputWidget( config );
	} else if ( paramDefinition.type === 'content' || paramDefinition.type === 'unbalanced-wikitext' ) {
		config.autosize = true;
		config.maxRows = 10;
		widget = new OO.ui.MultilineTextInputWidget( config );
	} else if ( paramDefinition.suggestedvalues !== undefined ) {
		// The handlng of suggestedvalues here matches what VisualEditor does in ve.ui.MWParameterPage.
		config.menu = { filterFromInput: true, highlightOnFilter: true };
		config.options = paramDefinition.suggestedvalues
			.filter( ( suggestedValue ) => typeof suggestedValue === 'string' )
			.map( ( suggestedValue ) => ( { data: suggestedValue, label: suggestedValue || '\xA0' } ) );
		widget = new OO.ui.ComboBoxInputWidget( config );
	} else {
		widget = new OO.ui.TextInputWidget( config );
	}
	if ( paramDefinition.autovalue ) {
		// Store the autovalue as data, so we can later tell if the value differs from it.
		widget.setData( { autovalue: paramDefinition.autovalue } );
	}
	return widget;
};

mw.TemplateWizard.TemplateForm.prototype.getParameters = function () {
	const params = {};
	for ( let i = 0; i < this.fields.length; i++ ) {
		const field = this.fields[ i ];
		if ( !field.isVisible() ) {
			// Don't include hidden fields.
			continue;
		}
		params[ field.getData().name ] = field.getField().getValue();
	}
	return params;
};

/**
 * Get one of the form's fields.
 *
 * @param {string} fieldName Name of the field to get.
 * @return {mw.TemplateWizard.ParamField|null}
 */
mw.TemplateWizard.TemplateForm.prototype.findField = function ( fieldName ) {
	for ( let i = 0; i < this.fields.length; i++ ) {
		const field = this.fields[ i ];
		// The 'name' data key is set in TemplateForm.getParamsAndFields().
		if ( field.getData().name === fieldName ) {
			return field;
		}
	}
	return null;
};

/**
 * Get the first field with any value.
 *
 * @return {boolean|OO.ui.Widget}
 */
mw.TemplateWizard.TemplateForm.prototype.getFirstFieldWithValue = function () {
	for ( let i = 0; i < this.fields.length; i++ ) {
		const field = this.fields[ i ];
		const val = field.getField().getValue();
		const data = field.getField().getData();
		// See if it's got a value and whether that value differs from the autovalue.
		if (
			val &&
			(
				data === undefined || data.autovalue === undefined ||
				( data.autovalue && val !== data.autovalue )
			)
		) {
			return field;
		}
	}
	return false;
};

/**
 * Get the first invalid field.
 *
 * @return {boolean|OO.ui.Widget}
 */
mw.TemplateWizard.TemplateForm.prototype.getInvalidField = function () {
	return this.invalidField;
};

/**
 * Get validity promises for all the fields.
 *
 * @return {jQuery.Promise[]}
 */
mw.TemplateWizard.TemplateForm.prototype.getFieldsValidity = function () {
	const validityPromises = [];
	// Go through the fields from bottom to top.
	for ( let i = this.fields.length; i--; ) {
		const field = this.fields[ i ].getField();
		const validity = field.getValidity();
		// Record this field as being the invalid one.
		validity.fail( () => {
			this.invalidField = field;
		} );
		validityPromises.push( validity );
	}
	return $.when.apply( $, validityPromises );
};

/**
 * @param {Object} templateData
 * @return {{required:Object<string,Object>,suggested:Object<string,Object>,optional:Object<string,Object>}}
 */
mw.TemplateWizard.TemplateForm.prototype.processParameters = function ( templateData ) {
	const params = templateData.params;
	const groupedParams = {
		required: {},
		suggested: {},
		optional: {}
	};
	// Optionally use paramOrder (which if present and not null must contain all params).
	const paramNames = templateData.paramOrder || Object.keys( params );
	paramNames.forEach( ( param ) => {
		const details = params[ param ];
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
