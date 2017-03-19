"use strict";

/* DOM REFS
=================================================================== */

var $app = void 0;
var $editor = void 0;
var $caret = void 0;
var $modeBtn = void 0;
var $aboutBtnOpen = void 0;
var $aboutBtnClose = void 0;
var $autosaveLabel = void 0;
var $wordcountLabel = void 0;
var $aboutModal = void 0;

/* GLOBALS
=================================================================== */

var caretFrame = void 0;
var sustainCaret = void 0;
var caretTimer = void 0;
var autosaveTimer = void 0;

/* BINDINGS
=================================================================== */

window.addEventListener("load", function () {

  // cache editor dom
  $app = document.getElementById("app");
  $editor = document.getElementById("editor");
  $caret = document.getElementById("caret");
  $modeBtn = document.getElementById("mode-btn");
  $aboutBtnOpen = document.getElementById("about-modal-link");
  $aboutBtnClose = document.getElementById("about-modal-close");
  $autosaveLabel = document.getElementById("autosave-label");
  $wordcountLabel = document.getElementById("wordcount-label");
  $aboutModal = document.getElementById("about-modal");

  // sync editor content between tabs
  window.addEventListener("storage", function (e) {
    pullEditor($editor, localStorage._c_txt);
    pullTheme(localStorage._c_thm);
  });

  // on editor input
  $editor.addEventListener("input", function (e) {
    pushLocal("_c_txt", $editor.innerText);
    maybeScroll($editor);
    cycleAutosaveLabel($autosaveLabel); // faux save label update
    updateWordcountLabel($wordcountLabel, $editor.innerText);
    maybeRandPlaceholder($editor); // random placeholder
  });

  // editor keydown
  $editor.addEventListener("keydown", function (e) {
    handleCmds(e);
    handleTabs(e); // insert actual tabs instead of default tabbing behavior
    handleRets(e, $editor); // fixes line break weirdness in FF & Safari
    showCaret($caret);
  });

  // editor keyup (empties editor when visually empty, so placeholder reappears)
  $editor.addEventListener("keyup", function (e) {
    return maybeEmpty($editor);
  });

  // editor paste
  $editor.addEventListener("paste", function (e) {
    handlePaste(e); // insert clipboard content w/o styling
    showCaret($caret);
  });

  // editor copy / cut (prevent copying of styles)
  $editor.addEventListener('copy', function (e) {
    return handleCopyOrCut(e);
  });
  $editor.addEventListener('cut', function (e) {
    return handleCopyOrCut(e);
  });

  // editor focus
  $editor.addEventListener("focus", function (e) {
    $caret.hidden = false;
    moveCaret($caret);
  });

  // editor blur
  $editor.addEventListener("blur", function (e) {
    $caret.hidden = true;
    cancelAnimationFrame(caretFrame);
  });

  // mouse clicks
  $editor.addEventListener("click", function (e) {
    return showCaret($caret);
  });
  $modeBtn.addEventListener("click", function (e) {
    return toggleTheme();
  });
  $aboutBtnOpen.addEventListener("click", function (e) {
    return showAboutModal($aboutModal);
  });
  $aboutBtnClose.addEventListener("click", function (e) {
    return hideAboutModal($aboutModal);
  });

  // start app
  init();
});

/* INITIALIZATION
=================================================================== */

var init = function init() {
  // content persistance
  if (!localStorage.getItem('_c_txt')) pushLocal("_c_txt", ""); // setup new storage for entry
  else pullEditor($editor, localStorage._c_txt); // load stored content into editor
  if (!localStorage.getItem('_c_thm')) pushLocal("_c_thm", "day"); // setup new storage for entry
  else pullTheme(localStorage._c_thm); // set stored theme
  // visual
  maybeEmpty($editor);
  $app.hidden = false;
  $editor.focus();
  blinkCaret($caret); // setup the cursor for blinking
  sustainCaret = false;
  $autosaveLabel.innerText = "SAVED " + time12();
  updateWordcountLabel($wordcountLabel, $editor.innerText);
  maybeRandPlaceholder($editor); // random placeholder
  updateMetaThemeColor(localStorage._c_thm);
};

/* STORAGE
=================================================================== */

var pushLocal = function pushLocal(key, value) {
  return localStorage.setItem(key, value);
};
var pullTheme = function pullTheme(className) {
  document.body.className = className;
  if (className == "day") $modeBtn.innerHTML = "NIGHT MODE";else $modeBtn.innerHTML = "DAY MODE";
};
var pullEditor = function pullEditor(el, textContent) {
  el.innerText = textContent;
  normalizeLinebreaks(el.innerText);
};

/* EDITOR OBJECTS
=================================================================== */

var moveCaret = function moveCaret() {
  $caret.style.left = getCaretCoords($editor).x - 2 + "px";
  $caret.style.top = getCaretCoords($editor).y - 8 + "px";
  if (document.getSelection().toString() == "") $caret.hidden = false;else $caret.hidden = true;
  caretFrame = requestAnimationFrame(moveCaret);
};

var blinkCaret = function blinkCaret(el) {
  var blinkme = setInterval(function () {
    if (el.hidden || sustainCaret) return;
    if (el.style.opacity == 1) el.style.opacity = 0;else el.style.opacity = 1;
  }, 570);
};

var showCaret = function showCaret(el) {
  el.style.opacity = 1;
  sustainCaret = true;
  if (caretTimer != null) clearTimeout(caretTimer);
  caretTimer = setTimeout(function () {
    return sustainCaret = false;
  }, 570);
};

var cycleAutosaveLabel = function cycleAutosaveLabel(el) {
  if (autosaveTimer != null) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(function () {
    el.innerText = "SAVING...";
    el.style.fontStyle = "italic";
    setTimeout(function () {
      el.innerText = "SAVED " + time12();
      el.style.fontStyle = "normal";
    }, 1200);
  }, 650);
};

var updateWordcountLabel = function updateWordcountLabel(el, strContent) {
  var words = strContent.trim().split(/\s+/).length;
  if (strContent == "") words = 0;
  el.innerText = words + " WORDS";
};

var maybeRandPlaceholder = function maybeRandPlaceholder(el) {
  if (el.innerText != "") return;
  var placeholders = ["And so it begins...", "Happy typing...", "It was a dark and stormy night...", "Once upon a time...", "It was the best of times, it was the worst of times...", "It was all just a dream..."];
  el.dataset.placeholder = placeholders[getRandomIntInclusive(0, placeholders.length - 1)];
};

/* APP CONTROLS
=================================================================== */

var handleCmds = function handleCmds(e) {
  var k = e.keyCode;
  if (k < 65 || k > 90) return;
  var cmd = (e.metaKey ? "⌘" : "") + String.fromCharCode(k);
  switch (cmd) {
    case "⌘B":
      e.preventDefault();break;
    case "⌘I":
      e.preventDefault();break;
  }
};

var toggleTheme = function toggleTheme() {
  if (document.body.className == "day") {
    document.body.className = "night";
    $modeBtn.innerHTML = "DAY MODE";
    pushLocal("_c_thm", "night"); // update storage
  } else {
    document.body.className = "day";
    $modeBtn.innerHTML = "NIGHT MODE";
    pushLocal("_c_thm", "day"); // update storage
  }
  $editor.dataset.placeholder = "Oohhh... " + localStorage._c_thm + " mode!";
  updateMetaThemeColor(localStorage._c_thm);
};

/* NORMALIZE CONTENTEDITABLE
=================================================================== */

var handleTabs = function handleTabs(e) {
  if (e.keyCode === 9) {
    e.preventDefault();
    document.execCommand("insertText", false, "     ");
  }
};

var handleRets = function handleRets(e, el) {
  if (e.keyCode === 13 && el.innerHTML == "" && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    e.preventDefault();
    document.execCommand("insertHTML", false, "<br><br>");
  }
};

var handlePaste = function handlePaste(e) {
  e.preventDefault();
  var clipText = (e.originalEvent || e).clipboardData.getData('text/plain');
  document.execCommand("insertText", false, clipText);
  normalizeLinebreaks($editor.innerText);
};

var handleCopyOrCut = function handleCopyOrCut(e) {
  var clipText = (e.originalEvent || e).clipboardData.getData('text/plain');
  e.clipboardData.setData('text/plain', clipText);
};

var normalizeLinebreaks = function normalizeLinebreaks(strContent) {
  var strArr = strContent.split("");
  for (var c = 0; c < strArr.length; c++) {
    if (strArr[c] === "\\" && strArr[c + 1] === "n") {
      strArr[c] = "<b";
      strArr[c + 1] = "r>";
    }
  }
  return strArr.join();
};

var maybeEmpty = function maybeEmpty(el) {
  if (el.innerText == "<br><br>" || el.innerText == "\n") el.innerText = "";
};

var maybeScroll = function maybeScroll(el) {
  if (getCaretIndex(el) >= el.textContent.length) scrollTo(0, document.body.scrollHeight);
};

/* ABOUT MODAL
=================================================================== */
var showAboutModal = function showAboutModal(el) {
  return el.hidden = false;
};
var hideAboutModal = function hideAboutModal(el) {
  return el.hidden = true;
};

/* HELPERS
=================================================================== */

var getRandomIntInclusive = function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var time12 = function time12() {
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  var t = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  m = m < 10 ? "0" + m : m;
  return h + ":" + m + t;
};

var updateMetaThemeColor = function updateMetaThemeColor(theme) {
  var c = void 0;
  if (theme == "day") c = "#f7f7f6";else if (theme == "night") c = '#1a1a19';
  document.querySelector('meta[name=theme-color]').remove();
  var meta = document.createElement('meta');
  meta.name = "theme-color";
  meta.content = c;
  document.getElementsByTagName('head')[0].appendChild(meta);
};

var getCaretIndex = function getCaretIndex(el) {
  var caretOffset = 0;
  if (typeof window.getSelection != "undefined" && true) {
    var range = window.getSelection().getRangeAt(0);
    var preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(el);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  } else if (typeof document.selection != "undefined" && document.selection.type != "Control" && true) {
    var textRange = document.selection.createRange();
    var preCaretTextRange = document.body.createTextRange();
    preCaretTextRange.moveToElementText(el);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }return caretOffset;
};

// INFO: stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
var getCaretCoords = function getCaretCoords(el) {
  var sel = document.selection,
      range = void 0,
      rect = void 0;
  var x = 0,
      y = 0;
  if (sel) {
    // 1:
    if (sel.type != "Control") {
      range = sel.createRange();
      range.collapse(true);
      x = range.boundingLeft, y = range.boundingTop;
    }
  } else if (window.getSelection) {
    // 2:
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange();
      if (range.getClientRects && el.innerText != "") {
        // if the editor is empty fall back to method 3
        range.collapse(true);
        if (range.getClientRects().length > 0) {
          rect = range.getClientRects()[0];
          x = rect.left, y = rect.top;
        }
      }if (x == 0 && y == 0) {
        // 3: fall back to inserting a temporary element
        var span = document.createElement("span");
        if (span.getClientRects) {
          // span with zero-width characer has dimensions and position
          span.appendChild(document.createTextNode("\u200B"));
          range.insertNode(span);
          rect = span.getClientRects()[0];
          x = rect.left, y = rect.top;
          var spanParent = span.parentNode;
          spanParent.removeChild(span);
          spanParent.normalize(); // glue any broken text nodes back together
        }
      }
    }
  }return { x: x, y: y };
};
