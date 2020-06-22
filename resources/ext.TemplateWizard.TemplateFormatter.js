/**
 * @class
 * @constructor
 */
mw.TemplateWizard.TemplateFormatter = function mwTemplateWizardTemplateFormatter() {
	this.name = '';
	this.format = '';
	this.params = {};
};
OO.initClass( mw.TemplateWizard.TemplateFormatter );
mw.TemplateWizard.TemplateFormatter.static.FORMATSTRING_REGEXP =
	/^(\n)?(\{\{ *_+)(\n? *\|\n? *_+ *= *)(_+)(\n? *\}\})(\n)?$/;
mw.TemplateWizard.TemplateFormatter.prototype.setTemplateName = function ( newName ) {
	this.name = newName;
};
mw.TemplateWizard.TemplateFormatter.prototype.setParameters = function ( params ) {
	// If any numbered parameters are set, all lower-numbered ones should be set as well (to blank).
	Object.keys( params ).forEach( function ( key ) {
		var paramNum;
		if ( !isNaN( key ) ) {
			for ( paramNum = 1; paramNum < key; paramNum++ ) {
				if ( params[ paramNum ] === undefined ) {
					params[ paramNum ] = '';
				}
			}
		}
	} );
	this.params = params;
};
mw.TemplateWizard.TemplateFormatter.prototype.setFormat = function ( format ) {
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
mw.TemplateWizard.TemplateFormatter.prototype.getFormat = function () {
	if ( !this.format ) {
		this.setFormat( 'inline' );
	}
	return this.format;
};
mw.TemplateWizard.TemplateFormatter.prototype.getTemplate = function () {
	var template, format,
		formatter = this;

	// Before building the template, fall back to inline format
	// if there are no parameters (T190123).
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
	// eslint-disable-next-line no-jquery/no-each-util
	$.each( this.params, function ( key, val ) {
		if ( !isNaN( key ) ) {
			// Render numeric/unnamed parameters inline, as Parsoid does it.
			template += formatter.constructor.static.formatStringSubst( '|', '' );
		} else {
			// Non-numeric keys are added as normal.
			template += formatter.constructor.static.formatStringSubst( format.paramName, key );
		}
		template += formatter.constructor.static.formatStringSubst( format.paramValue, val );
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
 *
 *  @param {string} format
 * @param {string} value
 * @return {string}
 */
mw.TemplateWizard.TemplateFormatter.static.formatStringSubst = function ( format, value ) {
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
