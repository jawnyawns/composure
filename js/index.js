"use strict"

/* MAIN -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- */

window.addEventListener("load", () => {
  // cache editor dom
  const $editor = document.getElementById("editor")

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

  // editor keydown
  $editor.addEventListener("keydown", e => {
    handleCmds(e, $editor) // disable contenteditable shortcuts, enable editor shortcuts
    handleTabs(e)     // insert actual tabs instead of default tabbing behavior
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
    e.preventDefault();
    document.execCommand("insertText", false, "\n\n");
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
