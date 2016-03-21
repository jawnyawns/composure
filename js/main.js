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

  $writer.on("keydown", function(e) {
    maintainPadding();
    tab(e);
  });
  $writer.on("keyup", maintainPadding);
  $(window).on("beforeunload", warning); // save work warning
  $(window).on("load", function() {
    $("[autofocus]").focus();
  });
  $writer.on("paste", function(e) {
    paste(e);
  });

  function maintainPadding() {
      var pos = $writer.prop("selectionStart");
      var end = $writer.text().length;
      console.log(pos);
      console.log(end);
      if(pos == end) $writer.scrollTop($writer[0].scrollHeight)
  }

  function tab(e) {
    if(e.keyCode === 9) {
      e.preventDefault();
      document.execCommand("InsertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    }
  }

  function paste(e) {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, text);
  }

  function warning() {
    if($writer.text() !== "") return "Leaving this page will delete everything! Make sure you've kept a copy of your work!";
  }

})(jQuery);
