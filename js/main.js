var writer = (function($) {

  // vars
  var ie = (typeof document.selection != "undefined" && document.selection.type != "Control") && true;
  var w3 = (typeof window.getSelection != "undefined") && true;
  // var resizeTimer;

  // cache
  var $window = $(window);
  var $writer = $("#writer");
  var $body = $("body");

  // events
  $window.one("load", function() {
    jsEnabled(); // check for js, otherwise leave app hidden
    autoFocus(); // autofocus
    // updateDimensions(600, 6.5, 15); // dimensions for any size screen
    maintainPadding(); // scroll down so user can scroll up to reveal menu
  });
  $window.on("beforeunload", warning);                           // save work warning
  // $(window).resize(function() {
  //   clearTimeout(resizeTimer);
  //   var resizeTimer = setTimeout(function() {
  //     updateDimensions(600, 7.5, 15); // dimensions for any size screen
  //   }, 200);
  // });
  $writer.on("keydown", function(e) {
    maintainPadding(); // autoscroll
    tab(e); // insert tab
    ret(e, $writer); // insert return
    menu.hideMenu(); // hide menu
  });
  $writer.on("keyup", function() {
    maintainPadding();
    emptyWhenEmpty();
  });                       // autoscroll
  $writer.on("paste", function(e) { paste(e); });             // paste

  // funcs
  function jsEnabled() {
    $writer.show();
    $("#error").hide();
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
    if(atEnd) $window.scrollTop($writer[0].scrollHeight)
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

      // BUG: needs to be if there is a char in front of cursor

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

  // to reinstate the placeholder text
  function emptyWhenEmpty() {
    if($writer.html() == "" || $writer.html() == "<br>" || $writer.html() == "<br></br>" || $writer.html() == null) $writer.html(null);
  }

  function warning() {
    if($writer.text() !== "") return "Leaving this page will delete everything! Make sure you've kept a copy of your work!";
  }

})(jQuery);

var menu = (function($) {

  // vars
  var lastScrollTop;
  var delta;

  // cache
  var $writer = $("#writer");
  var $menu = $("#menu");
  var $window = $(window);
  var $body = $("body");

  // events
  $window.scroll(function() {
    showMenuMaybe();
  });

  // funcs
  var lastSt = 0;
  var delta = 1/$window.height(); // 1% of height
  function showMenuMaybe() {
    var st = $(this).scrollTop();
    if (Math.abs(lastSt - st) < delta) return;
    if (st >= lastSt) { hideMenu(); }
    else { showMenu(); }
    lastSt = st;
  }

  function showMenu() {
    $body.addClass("show-menu");
  }

  function hideMenu() {
    $body.removeClass("show-menu");
  }

  // api
  return {
    hideMenu: hideMenu
  }

})(jQuery);
