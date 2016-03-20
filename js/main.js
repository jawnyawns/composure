var $writer = $("#writer");

var menu = (function($) {

  // variables
  // cache DOM
  // cache resources
  // bind events
  // functions
  // API

})(jQuery);

var writer = (function($) {

  $writer.on("keydown keyup", maintainPadding); // scroll to bottom if caret is at end of textarea
  $(window).on("beforeunload", warning); // save work warning

  function maintainPadding() {
      var pos = $writer.prop("selectionStart");
      var end = $writer.val().length;
      if(pos == end) $writer.scrollTop($writer[0].scrollHeight)
  }

  function warning() {
    if($writer.val() !== "") return "Leaving this page will delete everything! Make sure you've kept a copy of your work!";
  }

})(jQuery);
