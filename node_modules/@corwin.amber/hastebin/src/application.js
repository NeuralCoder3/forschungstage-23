import { haste } from './client';


/**
 * Default Hastebin application view.
 * Uses a `<textarea>` for editing, a `<div>` for read-only display.
 */
class HasteView {
  constructor() {
    this.$textarea = $('textarea');
    this.$box = $('#box');
    this.$code = $('#box code');
    this.$linenos = $('#linenos');
    tabKeyBehavior(this.$textarea);
  }

  set(text, mode, info={}) {
    if (mode == 'w') {
      this.$box.hide();
      this.$textarea.val(text).show('fast', function() {
        this.focus();
      });
      this.removeLineNumbers();
    }
    else {
      this.$code.html(text);
      this.$textarea.val('').hide();
      this.$box.show();
      this.addLineNumbers(info.lineCount);
    }
    /** @todo language highlighting */
  }

  get() {
    return this.$textarea.val();
  }

  /**
   * Create line numbers 1..`lineCount`.
   */
  addLineNumbers(lineCount) {
    var h = '';
    for (var i = 0; i < lineCount; i++) {
      h += `${i + 1}<br/>`;
    }
    this.$linenos.html(h);
  };
  
  /**
   * Remove the line numbers.
   */
  removeLineNumbers() {
    this.$linenos.html('&gt;');
  };  
}

///// Tab behavior in the textarea - 2 spaces per tab
function tabKeyBehavior($textarea, indent = '  ') {
  $textarea.on('keydown', function(evt) {
    if (evt.keyCode === 9) {
      evt.preventDefault();
      var myValue = indent;
      // http://stackoverflow.com/questions/946534/insert-text-into-textarea-with-jquery
      // For browsers like Internet Explorer
      if (document.selection) {
        this.focus();
        var sel = document.selection.createRange();
        sel.text = myValue;
        this.focus();
      }
      // Mozilla and Webkit
      else if (this.selectionStart || this.selectionStart == '0') {
        var startPos = this.selectionStart;
        var endPos = this.selectionEnd;
        var scrollTop = this.scrollTop;
        this.value = this.value.substring(0, startPos) + myValue +
          this.value.substring(endPos,this.value.length);
        this.focus();
        this.selectionStart = startPos + myValue.length;
        this.selectionEnd = startPos + myValue.length;
        this.scrollTop = scrollTop;
      }
      else {
        this.value += myValue;
        this.focus();
      }
    }
  });
}

// after page is loaded
$(function() {
  var app = new haste('hastebin', { twitter: true });
  app.view = new HasteView();
  app.configureButtons();
  app.configureShortcuts();
  
  // Handle pop from history
  var handlePop = function(evt) {
    var path = evt.target.location.pathname;
    if (path === '/') { app.newDocument(true); }
    else { app.loadDocument(path.substring(1, path.length)); }
  };
  // Set up the pop state to handle loads, skipping the first load
  // to make chrome behave like others:
  // http://code.google.com/p/chromium/issues/detail?id=63040
  setTimeout(function() {
    window.onpopstate = function(evt) {
      try { handlePop(evt); } catch(err) { /* not loaded yet */ }
    };
  }, 1000);

  if (window.location.protocol.match(/^https?:/)) {
    handlePop({ target: window });
  }
  else {
    app.config.baseURL =  'http://localhost:8080';
    app.newDocument(true);
  }

  window.app = app;
});
