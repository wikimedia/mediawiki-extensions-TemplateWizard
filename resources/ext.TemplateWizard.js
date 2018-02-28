( function ( mw, $, OO ) {

	/*
	 * Messages will be moved to JSON files later on.
	 */
	mw.messages.set( 'templatewizard-opens-in-new-tab', 'Opens in new tab' );
	mw.messages.set( 'templatewizard-help-page', 'help page' );
	mw.messages.set( 'templatewizard-template-not-found',
		'$1 can not be used in the Template Wizard.' +
		' This may be because it doesn\'t exist or because it doesn\'t have $2 tags.' +
		' Please fix that and try again.' +
		' If you think you\'ve found a bug tell us about it on the $3.'
	);
	mw.messages.set( 'templatewizard-default', 'Default: $1' );
	mw.messages.set( 'templatewizard-parameters-required', 'Required parameters' );
	mw.messages.set( 'templatewizard-parameters-suggested', 'Suggested parameters' );
	mw.messages.set( 'templatewizard-parameters-optional', 'Optional parameters' );

	function TemplateForm() {
		var $formHtml, $header, title, groupedParams = {},
			setupHeader, loadTemplateData, processTemplateData, processParameter, addParameterFieldsets,
			getInputWidgetForParam;

		/**
		 * Set the template title.
		 * @param {string} newTitle No leading 'Template:' required.
		 */
		this.setTitle = function ( newTitle ) {
			title = new mw.Title( 'Template:' + newTitle );
		};

		/**
		 *
		 */
		setupHeader = function () {
			var link;
			link = $( '<a>' )
				.attr( 'target', '_blank' )
				.attr( 'title', 'Opens in new tab' )
				.attr( 'href', title.getUrl() )
				.text( title.getMainText() );
			$header = $( '<h2>' ).html( link );
		};

		processParameter = function ( param, details ) {
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
		};

		getInputWidgetForParam = function ( paramDefinition ) {
			var widget, config = {};
			if ( paramDefinition.autovalue ) {
				config.value = paramDefinition.autovalue;
			}
			if ( paramDefinition.required ) {
				config.required = true;
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
				widget = new mw.widgets.MediaSearchWidget( config );
			} else if ( paramDefinition.type === 'wiki-template-name' ) {
				config.namespace = mw.config.get( 'wgNamespaceIds' ).template;
				widget = new mw.widgets.TitleInputWidget( config );
			} else {
				widget = new OO.ui.TextInputWidget( config );
			}
			return widget;
		};

		addParameterFieldsets = function () {
			$.each( groupedParams, function ( groupName, group ) {
				var fieldsetLabel = mw.message( 'templatewizard-parameters-' + groupName ).text(),
					fieldset = new OO.ui.FieldsetLayout( { label: fieldsetLabel } );
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
					var widget, field, label, description;
					widget = getInputWidgetForParam( details );
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
					field = new OO.ui.FieldLayout( widget, {
						label: label,
						help: description
					} );
					fieldset.addItems( [ field ] );
				} );
				if ( !fieldset.isEmpty() ) {
					$formHtml.append( fieldset.$element );
				}
			} );
		};

		processTemplateData = function ( apiResponse ) {
			var id, templateData, description, templateLink, templateDataLink, helpLink;
			// Get the first page's template data.
			id = $.map( apiResponse.pages, function ( _value, key ) { return key; } );
			templateData = apiResponse.pages[ id ];
			description = '';
			if ( templateData.description ) {
				description = templateData.description;
			} else if ( templateData.missing !== undefined || templateData.params === undefined ) {
				// Treat non-existant and non-TemplateData templates the same.
				templateLink = $( '<a>' )
					.attr( 'target', '_blank' )
					.attr( 'title', mw.message( 'templatewizard-opens-in-new-tab' ) )
					.attr( 'href', title.getUrl() )
					.text( '{{' + title.getMainText() + '}}' );
				templateDataLink = $( '<a>' )
					.attr( 'target', '_blank' )
					.attr( 'title', mw.message( 'templatewizard-opens-in-new-tab' ) )
					.attr( 'href', 'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:TemplateData#Structure_of_TemplateData' )
					.text( 'TemplateData' );
				helpLink = $( '<a>' )
					.attr( 'target', '_blank' )
					.attr( 'title', 'Opens in new tab' )
					.attr( 'href', 'https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:TemplateWizard' )
					.text( mw.message( 'templatewizard-help-page' ) );
				description = mw.message(
					'templatewizard-template-not-found',
					templateLink[ 0 ].outerHTML,
					templateDataLink[ 0 ].outerHTML,
					helpLink[ 0 ].outerHTML
				).plain();
			}
			if ( description ) {
				$header.after( $( '<p>' ).addClass( 'description' ).append( description ) );
			}
			if ( templateData.params ) {
				groupedParams = {
					required: {},
					suggested: {},
					optional: {}
				};
				$.each( templateData.params, processParameter );
				addParameterFieldsets();
			}
		};

		/**
		 *
		 */
		loadTemplateData = function () {
			var $spinner = $.createSpinner( { id: 'templateLoad', size: 'large', type: 'block' } );
			$header.after( $spinner );
			new mw.Api().get( {
				action: 'templatedata',
				titles: title.getPrefixedDb(),
				redirects: true,
				doNotIgnoreMissingTitles: true,
				lang: mw.config.get( 'wgUserLanguage' )
			} )
				.done( processTemplateData )
				.fail( /* @TODO */ )
				.always( function () {
					$spinner.remove();
				} );
		};

		/**
		 * @returns {jQuery}
		 */
		this.getHtml = function () {
			if ( !title ) {
				return '';
			}
			setupHeader();
			$formHtml = $( '<div>' ).addClass( 'TemplateForm' );
			$formHtml.append( $header );
			loadTemplateData();
			return $formHtml;
		};
	}

	function SearchForm() {
		this.setDialog = function ( dialog ) {
			this.dialog = dialog;
		};

		this.onSearchButtonClick = function () {
			var form = new TemplateForm();
			try {
				form.setTitle( this.titleSearchWidget.value );
				this.dialog.setResultsPanel( form.getHtml() );
			} catch ( e ) {
				this.titleSearchWidget.$input.focus();
				this.titleSearchWidget.$element.addClass( 'oo-ui-flaggedElement-invalid' );
				// this.searchField.setErrors( [ e.message ] );
			}
		};

		this.onSearchWidgetChange = function () {
			this.titleSearchWidget.$element.removeClass( 'oo-ui-flaggedElement-invalid' );
		};

		this.onSearchWidgetEnter = function () {
			this.searchButton.$button.focus();
			this.searchButton.emit( 'click' );
		};

		this.getSearchPanel = function () {
			var searchPanel;
			this.titleSearchWidget = new mw.widgets.TitleInputWidget( {
				validate: true,
				namespace: mw.config.get( 'wgNamespaceIds' ).template
			} );
			this.titleSearchWidget.connect( this, { change: 'onSearchWidgetChange', enter: 'onSearchWidgetEnter' } );
			this.searchButton = new OO.ui.ButtonWidget( { label: 'Use', flags: [ 'progressive' ] } );
			this.searchButton.connect( this, { click: 'onSearchButtonClick' } );
			this.searchField = new OO.ui.ActionFieldLayout(
				this.titleSearchWidget,
				this.searchButton,
				{ label: 'Select a template:' }
			);
			searchPanel = new OO.ui.PanelLayout( { padded: true, expanded: true } );
			searchPanel.$element.append( this.searchField.$element );

			return searchPanel;
		};
	}

	function TemplateWizard( config ) {
		TemplateWizard.super.call( this, config );
	}
	OO.inheritClass( TemplateWizard, OO.ui.ProcessDialog );
	TemplateWizard.static.name = 'templateWizard';
	TemplateWizard.static.title = 'Template Wizard';
	TemplateWizard.static.actions = [
		{ label: 'Insert', flags: [ 'primary', 'progressive' ], action: 'insert' },
		{ label: 'Cancel', flags: 'safe' }
	];
	TemplateWizard.prototype.getBodyHeight = function () {
		return 400;
	};
	TemplateWizard.prototype.initialize = function () {
		var searchForm, searchPanel;
		TemplateWizard.super.prototype.initialize.apply( this, arguments );

		// Set up the search from.
		searchForm = new SearchForm();
		searchForm.setDialog( this );
		searchPanel = searchForm.getSearchPanel();

		// Set up the results area.
		this.resultsPanel = new OO.ui.PanelLayout( { padded: true, expanded: true } );

		// Put the panels together and add to the dialog body.
		this.stack = new OO.ui.StackLayout( { items: [ searchPanel, this.resultsPanel ], continuous: true } );
		this.$body.append( this.stack.$element );
	};
	TemplateWizard.prototype.setResultsPanel = function ( panelContents ) {
		this.resultsPanel.$element.html( panelContents );
	};

	function addButton() {
		$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
			section: 'main',
			group: 'insert',
			tools: {
				'template-wizard': {
					label: 'Insert template',
					type: 'button',
					icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Edit-metadata.svg/22px-Edit-metadata.svg.png',
					action: {
						type: 'callback',
						execute: function () {
							var templateWizard = new TemplateWizard(),
								windowManager = new OO.ui.WindowManager();
							$( 'body' ).append( windowManager.$element );
							windowManager.addWindows( [ templateWizard ] );
							windowManager.openWindow( templateWizard );
						}
					}
				}
			}
		} );
	}

	function main() {
		var isEditing = $.inArray( mw.config.get( 'wgAction' ), [ 'edit', 'submit' ] ) !== -1;
		if ( !isEditing ) {
			return;
		}
		// Otherwise, add the toolbar button.
		mw.loader.using( 'user.options', function () {
			var dependencies;
			// This can be the string "0" if the user disabled the preference.
			if ( mw.user.options.get( 'usebetatoolbar' ) ) {
				dependencies = [
					'ext.wikiEditor',
					'jquery.spinner',
					'oojs-ui-core',
					'oojs-ui-windows',
					'mediawiki.widgets'
				];
				mw.loader.using( dependencies, $.ready ).then( addButton );
			}
		} );
	}

	main();
}( mediaWiki, jQuery, OO ) );
