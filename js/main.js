var $writer = $("#writer");
var wind = $(window);



var writer = (function($) {

  // VARS
  // ===========================================================
  var ie = (typeof document.selection != "undefined" && document.selection.type != "Control") && true;
  var w3 = (typeof window.getSelection != "undefined") && true;
  // var resizeTimer;



  // BINDS
  // ===========================================================
  wind.one("ready", function() {
    jsEnabled(); // check for js, otherwise leave app hidden
    updateDimensions(600, 6.5, 15); // dimensions for any size screen
    autoFocus()
  }); // autofocus
  wind.on("beforeunload", warning);                           // save work warning
  // $(window).resize(function() {
  //   clearTimeout(resizeTimer);
  //   var resizeTimer = setTimeout(function() {
  //     updateDimensions(600, 7.5, 15); // dimensions for any size screen
  //   }, 200);
  // });
  $writer.on("keydown", function(e) {
    maintainPadding();                                        // autoscroll
    tab(e);                                                   // insert tab
    ret(e, $writer);                                          // insert return
    // $("body").removeClass("show-menu"); // hide menu
  });
  $writer.on("keyup", maintainPadding);                       // autoscroll
  $writer.on("paste", function(e) { paste(e); });             // paste



  // FUNCS
  // ===========================================================
  function jsEnabled() {
    // $writer.show();
  }

  function autoFocus() {
    $("[autofocus]").focus();
  }

  function getCaretPos(element) {
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
    var atEnd = (getCaretPos($writer.get(0)) == $writer.text().length) ? true : false;
    if(atEnd) wind.scrollTop($writer[0].scrollHeight)
  }

  function tab(e) {
    if(e.keyCode === 9) {
      e.preventDefault();
      var tabText = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      document.execCommand("InsertHTML", false, tabText);
    }
  }

  function ret(e, el) {
    if(e.keyCode === 13) {
      e.preventDefault();
      var retText;
      var atEnd = (getCaretPos($writer.get(0)) == $writer.text().length) ? true : false;
      retText = "<br>";
      if(atEnd) retText = "<br><br>";
      document.execCommand("InsertHTML", false, retText);
    }
  }

  function paste(e) {
    e.preventDefault();
    var clipboardText = (e.originalEvent || e).clipboardData.getData('text/plain');
    document.execCommand("insertHTML", false, clipboardText);
  }

  // function updateDimensions(MaxWidthInPx, vertPaddingInPer, minPaddingInPx) {
  //   var x = ($(window).width() - MaxWidthInPx) / 2 ;
  //   if (x < minPaddingInPx) x = minPaddingInPx;
  //   var y = vertPaddingInPer;
  //   var adjustedHeight = $(window).height() - (($(window).width() * (y / 100)) * 2);
  //   var adjustedWidth = MaxWidthInPx;
  //   if ($(window).width() < MaxWidthInPx) {
  //     adjustedWidth = $(window).width() - (x*2);
  //   }
  //   $writer.css({
  //     "padding-top" : y + "%",
  //     "padding-right" : x,
  //     "padding-bottom" : y + "%",
  //     "padding-left" : x,
  //     "width" : adjustedWidth,
  //     "height" : adjustedHeight
  //   });
  // }

  function warning() {
    if($writer.text() !== "") return "Leaving this page will delete everything! Make sure you've kept a copy of your work!";
  }

})(jQuery);










// plugins
//
// $(function() {
//   var lastScrollTop = 0,
//     delta = 30;
//   $("#writer").scroll(function(event) {
//     var st = $(this).scrollTop();
//     if (Math.abs(lastScrollTop - st) < delta)
//       return;
//     if (st >= lastScrollTop) {
//       $("body").removeClass("show-menu");
//     } else {
//       $("body").addClass("show-menu");
//     }
//     lastScrollTop = st;
//   });
// });








var menu = (function($) {

  // variables
  // cache DOM
  var $writer = $("#writer");
  var $menu = $("#menu");

  // cache resources
  // bind events
  // $writer.on("scroll", function() {
    // console.log("hello");
  // });

  // functions
  function showMenu() {

  }

  // API

})(jQuery);
