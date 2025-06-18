const KEYCODE_TAB = 9
const STORAGE_KEY = "composure_text"

const $editor = document.querySelector("#editor")

window.addEventListener("DOMContentLoaded", onDOMContentLoaded)
$editor.addEventListener("keydown", onKeydown)
$editor.addEventListener("input", onInput)

function onDOMContentLoaded(event) {
  loadText($editor, window.localStorage)
  resetCaret($editor)
}

function onKeydown(event) {
  insertTab($editor, event)
  saveText($editor, window.localStorage)
  autoScroll($editor)
}

function onInput(event) {
  saveText($editor, window.localStorage)
  autoScroll($editor)
}

function loadText(elem, storage) {
  elem.value = storage.getItem(STORAGE_KEY)
}

function saveText(elem, storage) {
  storage.setItem(STORAGE_KEY, elem.value)
}

function insertTab(elem, event) {
  if (event.keyCode === KEYCODE_TAB) {
    event.preventDefault()
    document.execCommand('insertText', false, '\t');
  }
}

function resetCaret(elem) {
  elem.selectionEnd = 0
}

function autoScroll(elem) {
  if (elem.selectionEnd == elem.value.length) {
    elem.scrollTop = elem.scrollHeight
  }
}
