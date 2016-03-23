var writer = (function($) {

  // cache
  var $window = $(window);
  var $writer = $("#writer");
  var $body = $("body");

  // vars
  var ie = (typeof document.selection != "undefined" && document.selection.type != "Control") && true;
  var w3 = (typeof window.getSelection != "undefined") && true;
  var resizeTimer;

  // events
  $window.one("load", function() {
    jsEnabled(); // check for js, otherwise leave app hidden
    autoFocus();
    updateDimensions(600, 6.5, 15); // dimensions
    scrollDownMaybe(); // scrolls down so user can scroll up to reveal menu
  });
  $window.on("beforeunload", warning); // warning to keep work
  $(window).resize(function() {
    clearTimeout(resizeTimer);
    var resizeTimer = setTimeout(function() {
      updateDimensions(600, 7.5, 15); // dimensions
    }, 200);
  });
  $writer.on("keydown", function(e) {
    insertTab(e);
    insertReturn(e);
    menu.hideMenu();
  });
  $writer.on("keyup", function() {
    scrollDownMaybe(); // to maintain bottom padding
    trulyEmptyMaybe(); // to reinstate the placeholder text
  });
  $writer.on("paste", function(e) { paste(e); }); // paste

  // funcs
  function jsEnabled() {
    $writer.show();
    $("#error").hide();
    $body.addClass("ready");
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

  function scrollDownMaybe() {
    var atEnd = (getCaretPos($writer.get(0)) == $writer.text().length) ? true : false;
    if(atEnd) $window.scrollTop($writer[0].scrollHeight)
  }

  function insertTab(e) {
    if(e.keyCode === 9) {
      e.preventDefault();
      var tabText = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      document.execCommand("InsertHTML", false, tabText);
    }
  }

  function insertReturn(e) {
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

  function updateDimensions(MaxWidthInPx, vertPaddingInPer, minHorizPaddingInPx) {
    var x = ($(window).width() - MaxWidthInPx) / 2 ;
    if (x < minHorizPaddingInPx) x = minHorizPaddingInPx;
    var y = vertPaddingInPer;
    if ($(window).width() < MaxWidthInPx) {
      adjustedWidth = $(window).width() - (x*2);
    }
    $writer.css({
      "padding-top" : y + "%",
      "padding-right" : x,
      "padding-bottom" : y + "%",
      "padding-left" : x
    });
  }

  function trulyEmptyMaybe() {
    if($writer.html() == "" || $writer.html() == "<br>" || $writer.html() == "<br></br>" || $writer.html() == null) $writer.html(null);
  }

  function warning() {
    if($writer.text() !== "") return "Leaving this page will delete everything! Make sure you've kept a copy of your work!";
  }

})(jQuery);

var menu = (function($) {

  // cache
  var $window = $(window);
  var $body = $("body");
  var $writer = $("#writer");
  var $menu = $("#menu div");
  var $themeBtn = $menu.find(":nth-child(1)");
  var $fullscreenBtn = $menu.find(":nth-child(2)");
  var $printBtn = $menu.find(":nth-child(3)");
  var $exportBtn = $menu.find(":nth-child(4)");
  var $emailBtn = $menu.find(":nth-child(5)");

  // vars
  var lastSt = 0;
  var delta = .5/$window.height(); // 1% of height

  // events
  $window.on("scroll", function() {
    showMenuMaybe();
  });
  $themeBtn.on("click", toggleTheme);
  $fullscreenBtn.on("click", toggleFullscreen);
  $printBtn.on("click", printWork);
  $exportBtn.on("click", exportWork);
  $emailBtn.on("click", sendWork);

  // funcs
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

  function toggleTheme() {
    $body.toggleClass("dark");
  }

  function toggleFullscreen() {
    try {
      if (screenfull.enabled) screenfull.toggle();
      else alert("Press F11 or ^⌘F to toggle Fullscreen");
    }
    catch(err) {
      alert("An error occurred, to use Fullscreen please reload the page.");
    }
  }

  function printWork() {
    window.print();
  }

  function exportWork() {
    var str = $writer.html();
    str = str.replace(/<br>/g, "\n");
    str = str.replace(/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/g, "%20%20%20%20%20");
    try {
      download(str, "LF-download.txt", "text/plain");
    }
    catch(err) {
      alert("An error occurred, to Export work please reload the page.");
    }
  }

  function sendWork() {
    var subj = "Written on LetterFocus";
    var str = $writer.html();
    str = str.replace(/<br>/g, "%0D%0A");
    str = str.replace(/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/g, "%20%20%20%20%20");
    str = str.replace(/ /g, "%20")
    var body = str;
    var emailLink = "mailto:?subject=" + subj + "&body=" + body;
    $emailBtn.attr("href", emailLink);
  }

  // api
  return {
    hideMenu: hideMenu
  }

})(jQuery);
