﻿/**
 * @license Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

(function() {
	/**
	 * Turn a DOM element with "contenteditable" attribute set to "true" into a
	 * CKEditor instance, check {@link CKEDITOR.dtd.$editable } for the list of
	 * allowed element names.
	 *
	 * @param {Object|String} element The DOM element (textarea), its ID or name.
	 * @param {Object} [config] The specific configurations to apply to this editor instance.
	 * @returns {CKEDITOR.editor} The editor instance created.
	 * @example
	 * &lt;div contenteditable="true" id="content"&gt;&lt:/textarea&gt;
	 * ...
	 * <b>CKEDITOR.inline( 'content' )</b>;
	 */
	CKEDITOR.inline = function( element, instanceConfig ) {
		element = CKEDITOR.dom.element.get( element );

		// Avoid multiple inline editor instances on the same element.
		if ( element.getEditor() )
			throw 'The editor instance "' + element.getEditor().name + '" is already attached to the provided element.';

		var editor = new CKEDITOR.editor( instanceConfig, element, CKEDITOR.ELEMENT_MODE_INLINE );

		// Initial editor data is simply loaded from the page element content to make
		// data retrieval possible immediately after the editor creation.
		editor.setData( element.getHtml(), null, true );

		// Once the editor is loaded, start the UI.
		editor.on( 'loaded', function() {
			editor.fire( 'uiReady' );

			// Enable editing on the element.
			editor.editable( element );

			// Editable itself is the outermost element.
			editor.container = element;

			// Load and process editor data.
			editor.setData( editor.getData( 1 ) );

			editor.fire( 'contentDom' );
			// Inline editing defaults to "wysiwyg" mode, so plugins don't
			// need to make special handling for this "mode-less" environment.
			editor.mode = 'wysiwyg';
			editor.fire( 'mode' );

			// The editor is completely loaded for interaction.
			editor.fireOnce( 'instanceReady' );
			CKEDITOR.fire( 'instanceReady', null, editor );

			// Clean on startup.
			editor.resetDirty();

			// give priority to plugins that relay on editor#loaded for bootstrapping.
		}, null, null, 10000 );

		// Handle editor destroying.
		editor.on( 'destroy', function() {
			editor.element.clearCustomData();
			delete editor.element;
		});

		return editor;
	};

	/**
	 * Call {@link CKEDITOR.inline} with all page elements with "contenteditable" attribute set to "true".
	 */
	CKEDITOR.inlineAll = function() {
		var el, data;

		for ( var name in CKEDITOR.dtd.$editable ) {
			var elements = CKEDITOR.document.getElementsByTag( name );

			for ( var i = 0, len = elements.count(); i < len; i++ ) {
				el = elements.getItem( i );

				if ( el.getAttribute( 'contenteditable' ) == 'true' ) {
					// Fire the "inline" event, making it possible to customize
					// the instance settings and eventually cancel the creation.

					data = {
						element: el, config: {} };

					if ( CKEDITOR.fire( 'inline', data ) !== false )
						CKEDITOR.inline( el, data.config );
				}
			}
		}
	};

	CKEDITOR.domReady( function() {
		!CKEDITOR.disableAutoInline && CKEDITOR.inlineAll();
	});
})();


/**
 * Avoid creating editor automatically on element which has attribute "contenteditable" set to the value "true".
 * @name CKEDITOR.disableAutoInline
 * @type Boolean
 * @default false
 * @example
 * <b>CKEDITOR.disableAutoInline</b> = true;
 */
