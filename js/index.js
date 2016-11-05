"use strict"

const $w = document.getElementById("writer")

addEventListener("load", () => {
  revealBody()
  $w.focus()
})

addEventListener("keydown", e => {
  maybeScroll()
  handleCmds(e, $w)
  handleTabs(e)
  handleRets(e, $w)
})

addEventListener("keyup", e => {
  maybeEmpty($w)
  maybeScroll()
})

addEventListener("paste", e => {
  handlePaste(e)
})

const toggleTheme = () => {
  let body = document.body
  if (body.className == "")
    body.className = "dark"
  else
    body.className = ""
}

const maybeEmpty = el => {
  if (el.innerText == "\n") el.innerText = ""
}

const maybeScroll = () => {
  if((getCaretIndex($w) >= $w.textContent.length) ? true : false)
    scrollTo(0,document.body.scrollHeight);
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

const handleCmds = (e, el) => {
  const k = e.keyCode
  let d = document, stopDef = true
  if (k < 65 || k > 90) return
  const cmd = (e.metaKey ? "⌘" : "") + String.fromCharCode(k)
  switch(cmd) {
    case "⌘L": toggleTheme(); break
    case "⌘B": d.execCommand("bold"); break
    case "⌘I": d.execCommand("italic"); break
    case "⌘U": d.execCommand("underline"); break
    case "⌘K": d.execCommand("strikethrough"); break
    case "⌘S": exportDoc(e, el); break
    case "⌘P": print(); break
    case "⌘J": openAboutPage(); break
    default: stopDef = false
  }
  if (stopDef) e.preventDefault()
}

const handleTabs = e => {
  if(e.keyCode === 9) {
    e.preventDefault();
    document.execCommand("insertText", false, "\t");
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

const revealBody = () => {
  document.body.style.display = "block"
}

const exportDoc = (e, el) => {
  e.preventDefault()
  let str = el.innerText
  try {
    download(str, "mono.txt", "text/plain")
  } catch (err) {
    alert("An error occurred, to Export work please reload the page.")
  }
}
