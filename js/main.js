var menu = (function($) {

  // variables
  // cache DOM
  var $writer = $("#writer");
  var $menu = $("#menu");

  // cache resources
  // bind events
  $writer.on("scroll", function() {
    console.log("hello");
  });

  // functions
  function showMenu() {

  }

  // API

})(jQuery);

var writer = (function($) {

  // VARS
  // ===========================================================
  var resizeTimer;



  // CACHE
  // ===========================================================
  var $writer = $("#writer");



  // BINDS
  // ===========================================================
  $(document).on("ready", function() {
    jsEnabled(); // check for js, otherwise leave app hidden
    updateDimensions(600, 6.5, 15); // dimensions for any size screen
    autofocus();
  });
  $(window).on("beforeunload", warning); // save work warning
  $(window).resize(function() {
    clearTimeout(resizeTimer);
    var resizeTimer = setTimeout(function() {
      updateDimensions(600, 7.5, 15); // dimensions for any size screen
    }, 200);
  });
  $writer.on("keydown", function(e) {
    tab(e); // insert tab
    $("body").removeClass("show-menu"); // hide menu
  });
  $writer.on("keyup", maintainPadding); // autoscroll



  // FUNCS
  // ===========================================================
  function jsEnabled() {
    $writer.css("display", "block");
  }

  function autofocus() {
    $writer.focus();
  }

  function maintainPadding() {
    var pos = $writer.prop("selectionStart");
    var end = $writer.val().length;
    if(pos == end) scrollDown($writer);
  }

  function scrollDown(el) {
    el.scrollTop(el[0].scrollHeight);
  }

  function tab(e) {
    if(e.keyCode == 9) {
      e.preventDefault();
      document.execCommand("InsertHTML", false, "     ");
    }
  }

  function warning() {
    if($writer.text() !== "") return "Leaving this page will delete everything! Make sure you've kept a copy of your work!";
  }

  function updateDimensions(MaxWidthInPx, vertPaddingInPer, minPaddingInPx) {
    var x = ($(window).width() - MaxWidthInPx) / 2 ;
    if (x < minPaddingInPx) x = minPaddingInPx;
    var y = vertPaddingInPer;
    var adjustedHeight = $(window).height() - (($(window).width() * (y / 100)) * 2);
    var adjustedWidth = MaxWidthInPx;
    if ($(window).width() < MaxWidthInPx) {
      adjustedWidth = $(window).width() - (x*2);
    }
    $writer.css({
      "padding-top" : y + "%",
      "padding-right" : x,
      "padding-bottom" : y + "%",
      "padding-left" : x,
      "width" : adjustedWidth,
      "height" : adjustedHeight
    });
  }

})(jQuery);



// plugins

$(function() {
  var lastScrollTop = 0,
    delta = 30;
  $("#writer").scroll(function(event) {
    var st = $(this).scrollTop();
    if (Math.abs(lastScrollTop - st) < delta)
      return;
    if (st >= lastScrollTop) {
      $("body").removeClass("show-menu");
    } else {
      $("body").addClass("show-menu");
    }
    lastScrollTop = st;
  });
});
