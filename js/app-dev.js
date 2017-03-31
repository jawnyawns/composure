"use strict"

/* DOM REFS
=================================================================== */

let $app
let $editor
let $caret
let $modeBtn
let $aboutBtnOpen
let $aboutBtnClose
let $autosaveLabel
let $wordcountLabel
let $aboutModal



/* GLOBALS
=================================================================== */

let caretFrame
let sustainCaret
let caretTimer
let autosaveTimer



/* BINDINGS
=================================================================== */

window.addEventListener("load", () => {

  // cache editor dom
  $app = document.getElementById("app")
  $editor = document.getElementById("editor")
  $caret = document.getElementById("caret")
  $modeBtn = document.getElementById("mode-btn")
  $aboutBtnOpen = document.getElementById("about-modal-link")
  $aboutBtnClose = document.getElementById("about-modal-close")
  $autosaveLabel = document.getElementById("autosave-label")
  $wordcountLabel = document.getElementById("wordcount-label")
  $aboutModal = document.getElementById("about-modal")

  // sync editor content between tabs
  window.addEventListener("storage", e => {
    pullEditor($editor, localStorage._c_txt)
    pullTheme(localStorage._c_thm)
  })

  // on editor input
  $editor.addEventListener("input", e => {
    pushLocal("_c_txt", $editor.innerText)
    maybeScroll($editor)
    cycleAutosaveLabel($autosaveLabel) // faux save label update
    updateWordcountLabel($wordcountLabel, $editor.innerText)
    maybeRandPlaceholder($editor) // random placeholder
  })

  // editor keydown
  $editor.addEventListener("keydown", e => {
    handleCmds(e)
    handleTabs(e) // insert actual tabs instead of default tabbing behavior
    handleRets(e, $editor) // fixes line break weirdness in FF & Safari
    showCaret($caret)
  })

  // editor keyup (empties editor when visually empty, so placeholder reappears)
  $editor.addEventListener("keyup", e => maybeEmpty($editor))

  // editor paste
  $editor.addEventListener("paste", e => {
    handlePaste(e) // insert clipboard content w/o styling
    showCaret($caret)
  })

  // editor copy / cut (prevent copying of styles)
  $editor.addEventListener('copy', e => handleCopyOrCut(e))
  $editor.addEventListener('cut', e => handleCopyOrCut(e))

  // editor focus
  $editor.addEventListener("focus", e => {
    $caret.hidden = false
    moveCaret($caret)
  })

  // editor blur
  $editor.addEventListener("blur", e => {
    $caret.hidden = true
    cancelAnimationFrame(caretFrame)
  })

  // mouse clicks
  $editor.addEventListener("click", e => showCaret($caret))
  $modeBtn.addEventListener("click", e => toggleTheme())
  $aboutBtnOpen.addEventListener("click", e => showAboutModal($aboutModal))
  $aboutBtnClose.addEventListener("click", e => hideAboutModal($aboutModal))

  // start app
  init()
})



/* INITIALIZATION
=================================================================== */

const init = () => {
  // content persistance
  if(!localStorage.getItem('_c_txt')) pushLocal("_c_txt", "") // setup new storage for entry
  else pullEditor($editor, localStorage._c_txt) // load stored content into editor
  if(!localStorage.getItem('_c_thm')) pushLocal("_c_thm", "day") // setup new storage for entry
  else pullTheme(localStorage._c_thm) // set stored theme
  // visual
  maybeEmpty($editor)
  $app.hidden = false
  $editor.focus()
  blinkCaret($caret) // setup the cursor for blinking
  sustainCaret = false
  $autosaveLabel.innerText = "SAVED " + time12()
  updateWordcountLabel($wordcountLabel, $editor.innerText)
  maybeRandPlaceholder($editor) // random placeholder
  updateMetaThemeColor(localStorage._c_thm)
}



/* STORAGE
=================================================================== */

const pushLocal = (key, value) => localStorage.setItem(key, value)
const pullTheme = (className) => {
  document.body.className = className
  if (className == "day")
    $modeBtn.innerHTML = "NIGHT MODE"
  else
    $modeBtn.innerHTML = "DAY MODE"
}
const pullEditor = (el, textContent) => {
  el.innerText = textContent
  normalizeLinebreaks(el.innerText)
}



/* EDITOR OBJECTS
=================================================================== */

const moveCaret = () => {
  $caret.style.left = getCaretCoords($editor).x - 2 + "px"
  $caret.style.top = getCaretCoords($editor).y - 8 + "px"
  if (document.getSelection().toString() == "")
    $caret.hidden = false
  else
    $caret.hidden = true
  caretFrame = requestAnimationFrame(moveCaret)
}

const blinkCaret = el => {
  let blinkme = setInterval(() => {
    if (el.hidden || sustainCaret) return
    if (el.style.opacity == 1)
      el.style.opacity = 0
    else
      el.style.opacity = 1
  }, 570)
}

const showCaret = el => {
  el.style.opacity = 1
  sustainCaret = true
  if (caretTimer != null) clearTimeout(caretTimer)
  caretTimer = setTimeout(() => sustainCaret = false, 570)
}

const cycleAutosaveLabel = el => {
  if (autosaveTimer != null) clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => {
    el.innerText = "SAVING..."
    el.style.fontStyle = "italic"
    setTimeout(() => {
      el.innerText = "SAVED " + time12()
      el.style.fontStyle = "normal"
    }, 1200)
  }, 650)
}

const updateWordcountLabel = (el, strContent) => {
  let words = strContent.trim().split(/\s+/).length
  if (strContent == "") words = 0
  el.innerText = words + " WORDS"
}

const maybeRandPlaceholder = el => {
  if (el.innerText != "") return
  let placeholders = [
    "And so it begins...",
    "Happy typing...",
    "It was a dark and stormy night...",
    "Once upon a time...",
    "It was the best of times, it was the worst of times...",
    "It was all just a dream..."
  ]
  el.dataset.placeholder = placeholders[getRandomIntInclusive(0,placeholders.length-1)]
}



/* APP CONTROLS
=================================================================== */

const handleCmds = e => {
  const k = e.keyCode
  if (k < 65 || k > 90) return
  const cmd = (e.metaKey ? "⌘" : "") + String.fromCharCode(k)
  switch(cmd) {
    case "⌘B": e.preventDefault(); break
    case "⌘I": e.preventDefault(); break
  }
}

const toggleTheme = () => {
  if (document.body.className == "day") {
    document.body.className = "night"
    $modeBtn.innerHTML = "DAY MODE"
    pushLocal("_c_thm", "night") // update storage
  } else {
    document.body.className = "day"
    $modeBtn.innerHTML = "NIGHT MODE"
    pushLocal("_c_thm", "day") // update storage
  }
  $editor.dataset.placeholder = "Oohhh... " + localStorage._c_thm + " mode!"
  updateMetaThemeColor(localStorage._c_thm)
}



/* NORMALIZE CONTENTEDITABLE
=================================================================== */

const handleTabs = e => {
  if(e.keyCode === 9) {
    e.preventDefault();
    document.execCommand("insertText", false, "     ");
  }
}

const handleRets = (e, el) => {
  if (e.keyCode === 13 && el.innerHTML == ""
  && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    e.preventDefault()
    document.execCommand("insertHTML", false, "<br><br>")
  }
}

const handlePaste = e => {
  e.preventDefault()
  let clipText = (e.originalEvent || e).clipboardData.getData('text/plain')
  document.execCommand("insertText", false, clipText)
  normalizeLinebreaks($editor.innerText)
}

const handleCopyOrCut = e => {
  let clipText = (e.originalEvent || e).clipboardData.getData('text/plain')
  e.clipboardData.setData('text/plain', clipText)
}

const normalizeLinebreaks = strContent => {
  let strArr = strContent.split("")
  for (let c = 0; c < strArr.length; c++) {
    if (strArr[c] === "\\" && strArr[c+1] === "n") {
      strArr[c] = "<b"
      strArr[c+1] = "r>"
    }
  }
  return strArr.join()
}

const maybeEmpty = el => {
  if (el.innerText == "<br><br>" || el.innerText == "\n") el.innerText = ""
}

const maybeScroll = el => {
  if(getCaretIndex(el) >= el.textContent.length)
    scrollTo(0,document.body.scrollHeight);
}



/* ABOUT MODAL
=================================================================== */
const showAboutModal = el => el.hidden = false
const hideAboutModal = el => el.hidden = true



/* HELPERS
=================================================================== */

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const time12 = () => {
  const d = new Date()
  let h = d.getHours()
  let m = d.getMinutes()
  let t = h >= 12 ? "PM" : "AM"
  h = h % 12
  h = h ? h : 12
  m = m < 10 ? "0" + m : m
  return h + ":" + m + t
}

const updateMetaThemeColor = theme => {
  let c
  if (theme == "day") c = "#f7f7f6"
  else if (theme == "night") c = '#1a1a19'
  document.querySelector('meta[name=theme-color]').remove()
  let meta = document.createElement('meta');
  meta.name = "theme-color"
  meta.content = c
  document.getElementsByTagName('head')[0].appendChild(meta);
}

const getCaretIndex = el => {
  let caretOffset = 0
  if ((typeof window.getSelection != "undefined") && true) {
    let range = window.getSelection().getRangeAt(0)
    let preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(el)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    caretOffset = preCaretRange.toString().length
  } else if ((typeof document.selection != "undefined"
      && document.selection.type != "Control") && true) {
    let textRange = document.selection.createRange()
    let preCaretTextRange = document.body.createTextRange()
    preCaretTextRange.moveToElementText(el)
    preCaretTextRange.setEndPoint("EndToEnd", textRange)
    caretOffset = preCaretTextRange.text.length
  } return caretOffset
}

// INFO: stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
const getCaretCoords = el => {
  let sel = document.selection, range, rect
  let x = 0, y = 0
  if (sel) { // 1:
    if (sel.type != "Control") {
      range = sel.createRange()
      range.collapse(true)
      x = range.boundingLeft, y = range.boundingTop
    }
  } else if (window.getSelection) { // 2:
    sel = window.getSelection()
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange()
      if (range.getClientRects && el.innerText != "") { // if the editor is empty fall back to method 3
        range.collapse(true)
        if (range.getClientRects().length > 0){
          rect = range.getClientRects()[0]
          x = rect.left, y = rect.top
        }
      } if (x == 0 && y == 0) { // 3: fall back to inserting a temporary element
        let span = document.createElement("span")
        if (span.getClientRects) {
          // span with zero-width characer has dimensions and position
          span.appendChild( document.createTextNode("\u200b") )
          range.insertNode(span)
          rect = span.getClientRects()[0]
          x = rect.left, y = rect.top
          let spanParent = span.parentNode
          spanParent.removeChild(span)
          spanParent.normalize() // glue any broken text nodes back together
        }
      }
    }
  } return { x: x, y: y }
}
