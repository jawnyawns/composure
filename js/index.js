"use strict"

/* MAIN -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

let $editor
let $caret
let caretFrame
let sustainCaret
let caretTimeBuff

window.addEventListener("load", () => {
  // cache editor dom
  $editor = document.getElementById("editor")
  $caret = document.getElementById("caret")

  // content persistance
  if(!localStorage.getItem('_m_txt')) {
    populateStorage("_m_txt", "") // setup new storage for entry
  } else {
    populateEditor($editor, localStorage._m_txt) // load stored content into editor
  } if(!localStorage.getItem('_m_thm')) {
    populateStorage("_m_thm", "day") // setup new storage for entry
  } else {
    setTheme(localStorage._m_thm) // set stored theme
  }

  // sync editor content between tabs
  window.addEventListener("storage", e => {
    populateEditor($editor, localStorage._m_txt)
    setTheme(localStorage._m_thm)
  })

  // update storage
  $editor.addEventListener("input", e => {
    populateStorage("_m_txt", $editor.innerText)
  })

  // window keydown
  window.addEventListener("keydown", e => {
    handleCmds(e, $editor) // disable contenteditable shortcuts, enable editor shortcuts
  })

  // editor keydown
  $editor.addEventListener("keydown", e => {
    handleTabs(e) // insert actual tabs instead of default tabbing behavior
    handleRets(e, $editor) // fixes line break weirdness in FF & Safari
    showCaret($caret) // stop blinking
  })

  // editor keyup
  $editor.addEventListener("keyup", e => {
    maybeScroll($editor) // scroll down when appropriate
    maybeEmpty($editor)  // empties editor when visually empty, so placeholder reappears
  })

  // editor paste
  $editor.addEventListener("paste", e => {
    handlePaste(e) // insert clipboard content w/o styling
    showCaret($caret) // stop blinking
  })

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

  // editor mouseclicks
  $editor.addEventListener("click", e => {
    showCaret($caret) // stop blinking
  })

  maybeEmpty($editor) // empties editor when visually empty, so placeholder reappears
  $editor.hidden = false // display editor
  $editor.focus() // focus editor
  blinkCaret($caret) // setup the cursor for blinking
  sustainCaret = false
})




/* STORAGE -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

const populateStorage = (ref, str) => {
  localStorage.setItem(ref, str)
}

const populateEditor = (el, str) => {
  el.innerText = str
}

const setTheme = (theme) => {
  document.body.className = theme
}




/* CUSTOM CARET -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

const moveCaret = () => {
  $caret.style.left = getCaretCoords($editor).x-1 + "px"
  $caret.style.top = getCaretCoords($editor).y-2 + "px"
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
  if (caretTimeBuff != null) clearTimeout(caretTimeBuff)
  caretTimeBuff = setTimeout(() => {
    sustainCaret = false
  }, 570)
}




/* KEYBOARD COMMANDS -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

const handleCmds = (e, el) => {
  const k = e.keyCode
  if (k < 65 || k > 90) return
  const cmd = (e.metaKey ? "⌘" : "") + String.fromCharCode(k)
  switch(cmd) {
    case "⌘E":
      e.preventDefault()
      toggleTheme()
      break
    case "⌘S":
      e.preventDefault()
      exportDoc(el)
      break
    case "⌘B": e.preventDefault(); break
    case "⌘I": e.preventDefault(); break
  }
}

const toggleTheme = () => {
  const body = document.body
  if (body.className == "day") {
    body.className = "night"
    populateStorage("_m_thm", "night") // update storage
  } else {
    body.className = "day"
    populateStorage("_m_thm", "day") // update storage
  }
}

const exportDoc = el => {
  try { download(el.innerText, "mono.txt", "text/plain") }
  catch (err) { alert("An error occurred.") }
}




/* NORMALIZE CONTENTEDITABLE -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

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
    document.execCommand("insertText", false, "\n\n")
  }
}

const handlePaste = e => {
  e.preventDefault()
  const clipText = (e.originalEvent || e).clipboardData.getData('text/plain')
  document.execCommand("insertHTML", false, clipText)
}

const maybeEmpty = el => {
  if (el.innerText == "\n") el.innerText = ""
}

const maybeScroll = el => {
  if(getCaretIndex(el) >= el.textContent.length)
    scrollTo(0,document.body.scrollHeight);
}




/* HELPERS -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

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

// http://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
const getCaretCoords = el => {
  let sel = document.selection, range, rect
  let x = 0, y = 0

  // METHOD 1
  if (sel) {
    if (sel.type != "Control") {
      range = sel.createRange()
      range.collapse(true)
      x = range.boundingLeft, y = range.boundingTop // <-- *
    }
  }
  // METHOD 2
  else if (window.getSelection) {
    sel = window.getSelection()
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange()
      if (range.getClientRects && el.innerText != "") { // if the editor is empty fall back to method 3
        range.collapse(true)
        if (range.getClientRects().length > 0){
          rect = range.getClientRects()[0]
          x = rect.left, y = rect.top // <-- *
        }
      }

      // METHOD 3
      if (x == 0 && y == 0) { // fall back to inserting a temporary element
        let span = document.createElement("span")
        if (span.getClientRects) {
          // span with zero-width characer has dimensions and position
          span.appendChild( document.createTextNode("\u200b") )
          range.insertNode(span)
          rect = span.getClientRects()[0]
          x = rect.left, y = rect.top // <-- *
          let spanParent = span.parentNode
          spanParent.removeChild(span)
          spanParent.normalize() // glue any broken text nodes back together
        }
      }
    }
  } return { x: x, y: y }
}
