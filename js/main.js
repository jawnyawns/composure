var $writer = $("#writer");
var wind = $(window);

var menu = (function($) {

  // variables
  // cache DOM
  // cache resources
  // bind events
  // functions
  // API

})(jQuery);

var writer = (function($) {

  // VARS
  // ===========================================================
  var ie = (typeof document.selection != "undefined" && document.selection.type != "Control") && true;
  var w3 = (typeof window.getSelection != "undefined") && true;



  // BINDS
  // ===========================================================
  wind.one("load", function() { $("[autofocus]").focus(); }); // autofocus
  wind.on("beforeunload", warning);                           // save work warning
  $writer.on("keydown", function(e) {
    maintainPadding();                                        // autoscroll
    tab(e);                                                   // insert tab
  });
  $writer.on("keyup", maintainPadding);                       // autoscroll
  $writer.on("paste", function(e) { paste(e); });             // paste



  // FUNCS
  // ===========================================================
  function getCaretPosition(element) {
    var caretOffset = 0;
    if (w3) {
      var range = window.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    } else if (ie) {
      var textRange = document.selection.createRange();
      var preCaretTextRange = document.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  }

  function maintainPadding() {
    var pos = getCaretPosition($writer.get(0));
    var end = $writer.text().length;
    if(pos == end) {
      wind.scrollTop($writer[0].scrollHeight);
      console.log("no poop!");
    }
  }

  function tab(e) {
    if(e.keyCode === 9) {
      e.preventDefault();
      var tabText = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      document.execCommand("InsertHTML", false, tabText);
    }
  }

  function paste(e) {
    e.preventDefault();
    var clipboardText = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, clipboardText);
  }

  function warning() {
    if($writer.text() !== "") return "Leaving this page will delete everything! Make sure you've kept a copy of your work!";
  }

})(jQuery);
