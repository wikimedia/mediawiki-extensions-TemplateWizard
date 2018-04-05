( function ( mw, $, OO ) {

	/* Extension namespace. */
	mediaWiki.TemplateWizard = {};

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
		this.title = mw.Title.newFromText( title, mw.config.get( 'wgNamespaceIds' ).template );
		if ( !this.title ) {
			throw new Error( mw.message( 'templatewizard-invalid-title' ) );
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
			.attr( 'title', mw.message( 'templatewizard-opens-in-new-tab' ) )
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
			var fieldsetLabel = mw.message( 'templatewizard-parameters-' + groupName ).text(),
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
					description += ' ' + mw.message( 'templatewizard-default', details.default );
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
		var id, templateData, description, errorMessage, groupedParams;
		// Get the first page's template data.
		id = $.map( apiResponse.pages, function ( _value, key ) {
			return key;
		} );
		templateData = apiResponse.pages[ id ];

		// 1. Description.
		description = '';
		if ( templateData.description ) {
			description = templateData.description;
		} else if ( templateData.missing !== undefined || templateData.params === undefined ) {
			// Either the template doesn't exist or doesn't have TemplateData.
			errorMessage = templateData.missing === undefined ?
				'templatewizard-no-templatedata' : 'templatewizard-template-not-found';
			description = mw.message(
				errorMessage,
				this.title.getMainText(),
				'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:TemplateData',
				'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:TemplateWizard'
			).parse();
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
		new mw.Api().get( {
			action: 'templatedata',
			titles: this.title.getPrefixedDb(),
			redirects: true,
			doNotIgnoreMissingTitles: true,
			lang: mw.config.get( 'wgUserLanguage' )
		} )
			.done( function ( apiResponse ) {
				var fieldsets = templateForm.processTemplateData( apiResponse );
				templateForm.$element.append( fieldsets );
			} )
			.always( function () {
				templateForm.dialog.popPending();
			} );
	};

	/**
	 * @class
	 * @constructor
	 * @param {OO.ui.ProcessDialog} dialog The dialog to attach the form to.
	 * @param {Object} [config] Configuration options.
	 */
	mediaWiki.TemplateWizard.SearchForm = function mediaWikiTemplateWizardSearchForm( dialog, config ) {
		mediaWiki.TemplateWizard.SearchForm.super.call( this, $.extend( { padded: true, expanded: true }, config ) );
		this.dialog = dialog;

		this.titleSearchWidget = new mw.widgets.TitleInputWidget( {
			validate: true,
			namespace: mw.config.get( 'wgNamespaceIds' ).template
		} );
		this.titleSearchWidget.connect( this, { change: 'onSearchWidgetChange', enter: 'onSearchWidgetEnter' } );
		this.searchButton = new OO.ui.ButtonWidget( { label: OO.ui.deferMsg( 'templatewizard-use' ), flags: [ 'progressive' ] } );
		this.searchButton.connect( this, { click: 'onSearchButtonClick' } );
		this.searchField = new OO.ui.ActionFieldLayout(
			this.titleSearchWidget,
			this.searchButton,
			{ label: OO.ui.deferMsg( 'templatewizard-select-template' ) }
		);
		this.titleSearchWidget.emit( 'change' );
		this.$element.append( this.searchField.$element );
	};
	OO.inheritClass( mediaWiki.TemplateWizard.SearchForm, OO.ui.PanelLayout );

	mediaWiki.TemplateWizard.SearchForm.prototype.getTemplateForm = function () {
		return this.templateForm;
	};

	mediaWiki.TemplateWizard.SearchForm.prototype.onSearchButtonClick = function () {
		this.searchField.setErrors( [] );
		try {
			this.templateForm = new mw.TemplateWizard.TemplateForm( this.dialog, this.titleSearchWidget.value );
		} catch ( e ) {
			this.titleSearchWidget.$input.focus();
			this.titleSearchWidget.$element.addClass( 'oo-ui-flaggedElement-invalid' );
			this.dialog.actions.setMode( 'choose' );
			this.searchField.setErrors( [ e.message ] );
			return;
		}
		this.dialog.setResultsPanel( this.templateForm.$element );
		this.dialog.actions.setMode( 'insert' );
	};

	mediaWiki.TemplateWizard.SearchForm.prototype.onSearchWidgetChange = function () {
		this.titleSearchWidget.$element.removeClass( 'oo-ui-flaggedElement-invalid' );
		this.searchButton.setDisabled( !this.titleSearchWidget.value );
	};

	mediaWiki.TemplateWizard.SearchForm.prototype.onSearchWidgetEnter = function () {
		this.searchButton.$button.focus();
		this.searchButton.emit( 'click' );
	};

	/**
	 * @class
	 * @constructor
	 */
	mediaWiki.TemplateWizard.TemplateFormatter = function mwTemplateWizardTemplateFormatter() {
		this.name = '';
		this.format = '';
		this.params = {};
	};
	OO.initClass( mediaWiki.TemplateWizard.TemplateFormatter );
	mediaWiki.TemplateWizard.TemplateFormatter.static.FORMATSTRING_REGEXP =
		/^(\n)?(\{\{ *_+)(\n? *\|\n? *_+ *= *)(_+)(\n? *\}\})(\n)?$/;
	mediaWiki.TemplateWizard.TemplateFormatter.prototype.setTemplateName = function ( newName ) {
		this.name = newName;
	};
	mediaWiki.TemplateWizard.TemplateFormatter.prototype.setParameters = function ( params ) {
		this.params = params;
	};
	mediaWiki.TemplateWizard.TemplateFormatter.prototype.setFormat = function ( format ) {
		var parsedFormat,
			inlineFormat = '{{_|_=_}}';
		if ( format === 'inline' ) {
			format = inlineFormat;
		}
		if ( format === 'block' ) {
			format = '{{_\n| _ = _\n}}';
		}
		// Check format string for validity, and fall back to 'inline' if it's not.
		parsedFormat = format.match( this.constructor.static.FORMATSTRING_REGEXP );
		if ( !parsedFormat ) {
			parsedFormat = inlineFormat.match( this.constructor.static.FORMATSTRING_REGEXP );
		}
		this.format = {
			startOfLine: parsedFormat[ 1 ],
			start: parsedFormat[ 2 ],
			paramName: parsedFormat[ 3 ],
			paramValue: parsedFormat[ 4 ],
			end: parsedFormat[ 5 ],
			endOfLine: parsedFormat[ 6 ]
		};
	};
	mediaWiki.TemplateWizard.TemplateFormatter.prototype.getFormat = function () {
		if ( !this.format ) {
			this.setFormat( 'inline' );
		}
		return this.format;
	};
	mediaWiki.TemplateWizard.TemplateFormatter.prototype.getTemplate = function () {
		var template, format,
			formatter = this;

		// Before building the template, fall back to inline format if there are no parameters (T190123).
		if ( $.isEmptyObject( this.params ) ) {
			this.setFormat( 'inline' );
		}
		format = this.getFormat();

		// Start building the template.
		template = '';
		if ( format.startOfLine ) {
			template += '\n';
		}
		template += this.constructor.static.formatStringSubst( format.start, this.name );

		// Process the parameters.
		$.each( this.params, function ( key, val ) {
			template += formatter.constructor.static.formatStringSubst( format.paramName, key ) +
				formatter.constructor.static.formatStringSubst( format.paramValue, val );
		} );

		// End and return the template.
		template += format.end;
		if ( format.endOfLine && !template.match( /\n$/ ) ) {
			template += '\n';
		}
		return template;
	};

	/**
	 * Format a part of the template, based on the TemplateData format string.
	 * This method is based on that of the same name in Parsoid:
	 * https://github.com/wikimedia/parsoid/blob/9c80dd597a8c057d43598303fd53e90cbed4ffdb/lib/html2wt/WikitextSerializer.js#L405
	 * @param {String} format
	 * @param {String} value
	 * @return {String}
	 */
	mediaWiki.TemplateWizard.TemplateFormatter.static.formatStringSubst = function ( format, value ) {
		value = value.trim();
		return format.replace( /_+/, function ( hole ) {
			if ( value === '' || hole.length <= value.length ) {
				return value;
			}
			// Right-pad with spaces.
			while ( value.length < hole.length ) {
				value += ' ';
			}
			return value;
		} );
	};

	/**
	 * The main dialog box for the TemplateWizard.
	 * @class
	 * @constructor
	 * @extends OO.ui.ProcessDialog
	 * @param {object} config
	 */
	mediaWiki.TemplateWizard.Dialog = function mediaWikiTemplateWizardDialog( config ) {
		mediaWiki.TemplateWizard.Dialog.super.call( this, config );
	};
	OO.inheritClass( mediaWiki.TemplateWizard.Dialog, OO.ui.ProcessDialog );
	mediaWiki.TemplateWizard.Dialog.static.name = 'templateWizard';
	mediaWiki.TemplateWizard.Dialog.static.title = OO.ui.deferMsg( 'templatewizard-dialog-title' );
	mediaWiki.TemplateWizard.Dialog.static.actions = [
		{ label: OO.ui.deferMsg( 'templatewizard-insert' ), flags: [ 'primary', 'progressive' ], action: 'insert', modes: 'insert' },
		{ label: OO.ui.deferMsg( 'templatewizard-cancel' ), flags: 'safe', modes: [ 'choose', 'insert' ] }
	];
	mediaWiki.TemplateWizard.Dialog.prototype.getBodyHeight = function () {
		return 400;
	};
	mediaWiki.TemplateWizard.Dialog.prototype.initialize = function () {
		mediaWiki.TemplateWizard.Dialog.super.prototype.initialize.apply( this, arguments );

		// Set up the search form and results panel.
		this.searchForm = new mw.TemplateWizard.SearchForm( this );
		this.resultsPanel = new OO.ui.PanelLayout( { padded: true, expanded: true } );

		// Put the panels together and add to the dialog body.
		this.stack = new OO.ui.StackLayout( { items: [ this.searchForm, this.resultsPanel ], continuous: true } );
		this.$body.append( this.stack.$element );
	};
	mediaWiki.TemplateWizard.Dialog.prototype.setResultsPanel = function ( panelContents ) {
		this.resultsPanel.$element.html( panelContents );
	};
	mediaWiki.TemplateWizard.Dialog.prototype.getSetupProcess = function ( data ) {
		return mediaWiki.TemplateWizard.Dialog.super.prototype.getSetupProcess.call( this, data )
			.next( function () {
			}, this );
	};
	mediaWiki.TemplateWizard.Dialog.prototype.getReadyProcess = function ( data ) {
		return mediaWiki.TemplateWizard.Dialog.super.prototype.getReadyProcess.call( this, data )
			.next( function () {
				this.actions.setMode( 'choose' );
				this.searchForm.titleSearchWidget.setValue( '' );
				this.searchForm.titleSearchWidget.focus();
			}, this );
	};
	mediaWiki.TemplateWizard.Dialog.prototype.getTeardownProcess = function ( data ) {
		return mediaWiki.TemplateWizard.Dialog.super.prototype.getTeardownProcess.call( this, data )
			.next( function () {
				this.setResultsPanel( '' );
			}, this );
	};
	mediaWiki.TemplateWizard.Dialog.prototype.getActionProcess = function ( action ) {
		var dialog = this, templateFormatter;
		if ( action === 'insert' ) {
			templateFormatter = new mw.TemplateWizard.TemplateFormatter();
			templateFormatter.setTemplateName( this.searchForm.getTemplateForm().getTitle().getMainText() );
			templateFormatter.setFormat( this.searchForm.getTemplateForm().getFormat() );
			templateFormatter.setParameters( this.searchForm.getTemplateForm().getParameters() );
			$( '#wpTextbox1' ).textSelection( 'encapsulateSelection', { post: templateFormatter.getTemplate() } );
			return new OO.ui.Process( function () {
				dialog.close( { action: action } );
			} );
		}
		// Fallback to parent handler.
		return mediaWiki.TemplateWizard.Dialog.super.prototype.getActionProcess.call( this, action );
	};

	$( '#wpTextbox1' ).on( 'wikiEditor-toolbar-doneInitialSections', function () {
		// Set up the TemplateWizard dialog window.
		var templateWizard = new mediaWiki.TemplateWizard.Dialog();
		OO.ui.getWindowManager().addWindows( [ templateWizard ] );

		// Add the toolbar button.
		$( this ).wikiEditor( 'addToToolbar', {
			section: 'main',
			group: 'insert',
			tools: {
				'template-wizard': {
					labelMsg: 'templatewizard-dialog-title',
					oouiIcon: 'puzzle',
					type: 'button',
					action: {
						type: 'callback',
						execute: function () {
							OO.ui.getWindowManager().openWindow( 'templateWizard' );
						}
					}
				}
			}
		} );
	} );

}( mediaWiki, jQuery, OO ) );
