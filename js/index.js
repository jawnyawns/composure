"use strict"

/* MAIN -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

let $editor
let $caret
let caretFrame

window.addEventListener("load", () => {
  // cache editor dom
  $editor = document.getElementById("editor")
  $caret = document.getElementById("caret")

  // content persistance
  if(!localStorage.getItem('_mwcs'))
    populateStorage("_mwcs", "") // setup new storage for entry
  else
    populateEditor($editor, localStorage._mwcs) // load stored content into editor

  // sync editor content between tabs
  window.addEventListener("storage", e => {
    populateEditor($editor, e.newValue)
  })

  // update storage
  $editor.addEventListener("input", e => {
    populateStorage("_mwcs", $editor.innerText)
  })

  // window keydown
  window.addEventListener("keydown", e => {
    handleCmds(e, $editor) // disable contenteditable shortcuts, enable editor shortcuts
  })

  // editor keydown
  $editor.addEventListener("keydown", e => {
    handleTabs(e) // insert actual tabs instead of default tabbing behavior
    handleRets(e, $editor) // fixes line break weirdness in FF & Safari
  })

  // editor keyup
  $editor.addEventListener("keyup", e => {
    maybeScroll($editor) // scroll down when appropriate
    maybeEmpty($editor)  // empties editor when visually empty, so placeholder reappears
  })

  // editor paste
  $editor.addEventListener("paste", e => {
    handlePaste(e) // insert clipboard content w/o styling
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

  // display and focus editor
  $editor.hidden = false
  $editor.focus()
})




/* STORAGE -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

const populateStorage = (ref, str) => {
  localStorage.setItem(ref, str)
}

const populateEditor = (el, str) => {
  el.innerText = str
}




/* CUSTOM CARET -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

const moveCaret = () => {
  console.log("!")
  $caret.style.left = getCaretCoords().x-1 + "px"
  $caret.style.top = getCaretCoords().y-1 + "px"
  if (document.getSelection().toString() == "")
    $caret.hidden = false
  else
    $caret.hidden = true
  caretFrame = requestAnimationFrame(moveCaret)
}




/* KEYBOARD COMMANDS -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

const handleCmds = (e, el) => {
  const k = e.keyCode
  if (k < 65 || k > 90) return
  const cmd = (e.metaKey ? "⌘" : "") + String.fromCharCode(k)
  switch(cmd) {
    case "⌘M":
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
  if (body.className == "day")
    body.className = "night"
  else
    body.className = "day"
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

const getCaretCoords = () => {
  const $w = window
  const $d = $w.document
  let sel = $d.selection, range, rects, rect
  let x = 0, y = 0
  if (sel) {
    if (sel.type != "Control") {
      range = sel.createRange()
      range.collapse(true)
      x = range.boundingLeft, y = range.boundingTop
    }
  } else if ($w.getSelection) {
    sel = $w.getSelection()
    if (sel.rangeCount) {
      range = sel.getRangeAt(0).cloneRange()
      if (range.getClientRects) {
        range.collapse(true)
        rects = range.getClientRects()
        if (rects.length > 0) rect = rects[0]
        x = rect.left, y = rect.top
      } if (x == 0 && y == 0) {
        let span = $d.createElement("span")
        if (span.getClientRects) {
          span.appendChild( $d.createTextNode("\u200b") )
          range.insertNode(span)
          rect = span.getClientRects()[0]
          x = rect.left, y = rect.top
          let spanParent = span.parentNode
          spanParent.removeChild(sspan)
          spanParent.normalize()
  }}}} return { x: x, y: y }
}
