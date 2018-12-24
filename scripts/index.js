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

  window.addEventListener("load", onWindowLoad)
  $editor.addEventListener("keydown", onEditorKeydown)
  $editor.addEventListener("input", onEditorInput)
  $button.addEventListener("click", onButtonClick)

  function onWindowLoad() {
    restoreNonEmptyText($editor, "composure_text")
    setCaretPos($editor, 0)
    restoreTheme($app.classList.contains("dark") ? "dark" : "light", "composure_theme", toggleDark)
  }

  function onEditorKeydown(event) {
  	if (event.keyCode === 9) {
  		manualTab($editor, event)
  	}
  }

  function onEditorInput(event) {
    inputScroll($editor)
    storeText($editor, "composure_text")
  }

  function onButtonClick(event) {
    toggleDark()
    storeTheme($app.classList.contains("dark"), "composure_theme")
  }

  function toggleDark() {
    $app.classList.toggle("dark")
    $theme.content = $theme.content === "#F1F3F4" ? "#2B2B2C" : "#F1F3F4"
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

  // Sets INPUT.value to the value locally stored at KEY,
  // if that value is not the empty string.
  function restoreNonEmptyText(input, key) {
    const storedText = window.localStorage.getItem(key)
    if (storedText != "") {
      input.value = storedText
    }
  }

  // Locally store the INPUT.value with KEY.
  function storeText(input, key) {
    window.localStorage.setItem(key, input.value)
  }

  // Use FN to apply the locally stored theme at KEY,
  // given the current THEME.
  function restoreTheme(currentTheme, key, fn) {
    const storedTheme = window.localStorage.getItem(key) || currentTheme
    if (storedTheme != currentTheme) {
      fn()
    }
  }

  // Locally store the THEME at KEY.
  function storeTheme(isDark, key) {
    if (isDark) {
      window.localStorage.setItem(key, "dark")
    } else {
      window.localStorage.setItem(key, "light")
    }
  }

  // Moves the INPUT's caret to position POS.
  function setCaretPos(input, pos) {
    input.selectionEnd = pos
  }
}());
