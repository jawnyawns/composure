"use strict";

(function () {
  //
  // Cache DOM elements.
  //

  const $app = document.querySelector(".app")
  const $editor = $app.querySelector(".editor")
  const $button = $app.querySelector(".button")
  const $theme = document.querySelector("meta[name=theme-color]")

  //
  // Event listeners and handlers.
  //

  window.addEventListener("load", onLoad)
  $editor.addEventListener("keydown", onKeydown)
  $button.addEventListener("click", toggleDark)

  function onLoad() {
    restoreText($editor, "composure_text")
    setCaretPos($editor, 0)
  }

  function onKeydown(event) {
  	if (event.keyCode === 9) {
  		manualTab($editor, event)
  	} else {
  		inputScroll($editor)
  	}
    storeText($editor, "composure_text")
  }

  function toggleDark() {
    $app.classList.toggle("dark")
    $theme.content = $theme.content === "#F7F7F7" ? "#1B1B1B" : "#F7F7F7"
    $editor.focus()
  }

  //
  // Various behaviors, decoupled from everything.
  //

  function scrollToBottom(elem) {
    elem.scrollTop = elem.scrollHeight
  }

  // Scroll to bottom of INPUT, when caret is near the end of the INPUT content
  function inputScroll(input) {
    if (input.selectionEnd >= input.value.length * 0.9) {
      scrollToBottom(input)
    }
  }

  // Forces tab press on EVENT to insert tab character into INPUT
  // at the current caret position instead of changing focus away.
  function manualTab(input, event) {
  	event.preventDefault()
  	insertAtCaret(input, "\t")
  }

  // Insert TEXT into INPUT at the current caret position.
  function insertAtCaret(input, text) {
    const value = input.value
    const start = input.selectionStart
    const end = input.selectionEnd
    input.value = value.slice(0, start) + text + value.slice(end)
    input.selectionStart = input.selectionEnd = start + text.length
  }

  // Sets INPUT.value to the value locally stored at KEY.
  function restoreText(input, key) {
    input.value = window.localStorage.getItem(key)
  }

  // Locally store the INPUT.value with KEY.
  function storeText(input, key) {
    window.localStorage.setItem(key, input.value)
  }

  // Moves the INPUT's caret to position POS.
  function setCaretPos(input, pos) {
    input.selectionEnd = pos
  }
}());
