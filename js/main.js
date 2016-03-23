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
    scrollDownMaybe();
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

  var $printBtn = $menu.find(":nth-child(3)");
  var $exportBtn = $menu.find(":nth-child(4)");

  // vars
  var lastSt = 0;
  var delta = 1/$window.height(); // 1% of height

  // events
  $window.on("scroll", function() {
    showMenuMaybe();
  });
  $themeBtn.on("click", toggleTheme);

  $printBtn.on("click", printWork);
  $exportBtn.on("click", exportWork);

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

  function printWork() {
    window.print(); console.log("sup")
  }

  function exportWork() {
    var str = $writer.html();
    str = str.replace(/<br>/g, "\n");
    str = str.replace(/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/g, "     ");
    download(str, "LF-download.txt", "text/plain");
  }

  // api
  return {
    hideMenu: hideMenu
  }

})(jQuery);

/*download.js by dandavis*/
!function(e,t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?module.exports=t():e.download=t()}(this,function(){return function e(t,n,o){function a(e){var t=e.split(/[:;,]/),n=t[1],o="base64"==t[2]?atob:decodeURIComponent,a=o(t.pop()),r=a.length,i=0,d=new Uint8Array(r);for(i;r>i;++i)d[i]=a.charCodeAt(i);return new h([d],{type:n})}function r(e,t){if("download"in m)return m.href=e,m.setAttribute("download",v),m.className="download-js-link",m.innerHTML="downloading...",b.body.appendChild(m),setTimeout(function(){m.click(),b.body.removeChild(m),t===!0&&setTimeout(function(){c.URL.revokeObjectURL(m.href)},250)},66),!0;if("undefined"!=typeof safari)return e="data:"+e.replace(/^data:([\w\/\-\+]+)/,s),window.open(e)||confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")&&(location.href=e),!0;var n=b.createElement("iframe");b.body.appendChild(n),t||(e="data:"+e.replace(/^data:([\w\/\-\+]+)/,s)),n.src=e,setTimeout(function(){b.body.removeChild(n)},333)}var i,d,l,c=window,s="application/octet-stream",f=o||s,u=t,p=!n&&!o&&u,b=document,m=b.createElement("a"),w=function(e){return String(e)},h=c.Blob||c.MozBlob||c.WebKitBlob||w,v=n||"download";if(h=h.call?h.bind(c):Blob,"true"===String(this)&&(u=[u,f],f=u[0],u=u[1]),p&&p.length<2048&&(v=p.split("/").pop().split("?")[0],m.href=p,-1!==m.href.indexOf(p))){var l=new XMLHttpRequest;return l.open("GET",p,!0),l.responseType="blob",l.onload=function(t){e(t.target.response,v,s)},l.send(),l}if(/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(u))return navigator.msSaveBlob?navigator.msSaveBlob(a(u),v):r(u);if(i=u instanceof h?u:new h([u],{type:f}),navigator.msSaveBlob)return navigator.msSaveBlob(i,v);if(c.URL)r(c.URL.createObjectURL(i),!0);else{if("string"==typeof i||i.constructor===w)try{return r("data:"+f+";base64,"+c.btoa(i))}catch(y){return r("data:"+f+","+encodeURIComponent(i))}d=new FileReader,d.onload=function(e){r(this.result)},d.readAsDataURL(i)}return!0}});
