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
      var end = $writer.val().length;
      if(pos == end) $writer.scrollTop($writer[0].scrollHeight)
  }

  function warning() {
    if($writer.val() !== "") return "Leaving this page will delete everything! Make sure you've kept a copy of your work!";
  }

  function tab(e) {
    if(e.keyCode == 9) {
      e.preventDefault();
      var textWithTab = $writer.val() + "     "; // 5 spaces
      $writer.val(textWithTab);
      console.log(textWithTab);
    }
  }

  function paste(e) {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, text);
  }

})(jQuery);
