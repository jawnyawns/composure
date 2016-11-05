"use strict"

window.addEventListener("load", () => { init() })

const init = () => {
  const $w = document.getElementById("writer") // cache app DOM

  $w.addEventListener("keydown", e => {
    maybeScroll($w)   // scroll down when appropriate
    handleCmds(e, $w) // disable default shortcuts, enable saving & theme toggling
    handleTabs(e)     // insert actual tab instead of default tab behavior
    handleRets(e, $w) // fixes line break weirdness in FF & Safari
  })

  $w.addEventListener("keyup", e => {
    maybeScroll($w) // scroll down when appropriate
    maybeEmpty($w)  // empties writer when functionally empty allowing placeholder text to reappear
  })

  $w.addEventListener("paste", e => { handlePaste(e) }) // insert clipboard content w/o styling

  $w.focus() // focus the writer

  document.body.style.display = "block" // show the app
}

const handleCmds = (e, el) => {
  const k = e.keyCode
  if (k < 65 || k > 90) return
  const cmd = (e.metaKey ? "⌘" : "") + String.fromCharCode(k)
  switch(cmd) {
    case "⌘M":
      e.preventDefault()
      toggleTheme()
      break
    case "⌘E":
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

const maybeEmpty = el => {
  if (el.innerText == "\n") el.innerText = ""
}

const maybeScroll = el => {
  if(getCaretIndex(el) >= el.textContent.length)
    scrollTo(0,document.body.scrollHeight);
}

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

const exportDoc = el => {
  try { download(el.innerText, "mono.txt", "text/plain") }
  catch (err) { alert("An error occurred.") }
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
