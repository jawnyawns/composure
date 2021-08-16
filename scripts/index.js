const KEYCODE_TAB = 9
const STORAGE_KEY = "composure_text"

//
// Main: define events and correspoinding state transitions.
//

const $editor = document.querySelector("#editor")

window.addEventListener("load", onLoad)
$editor.addEventListener("keydown", onKeydown)
$editor.addEventListener("input", onInput)

function onLoad(event) {
    load($editor, window.localStorage)
    resetCaret($editor)
}

function onKeydown(event) {
    insertTab($editor, event)
    save($editor, window.localStorage)
    autoScroll($editor)
}

function onInput(event) {
    save($editor, window.localStorage)
    autoScroll($editor)
}

//
// Business functions: represent state transitions to perform upon certain events.
// Only mutates passed-in elements.
//

function load(elem, storage) {
    elem.value = storage.getItem(STORAGE_KEY)
}

function save(elem, storage) {
    storage.setItem(STORAGE_KEY, elem.value)
}

function insertTab(elem, event) {
    if (event.keyCode === KEYCODE_TAB) {
        event.preventDefault()
        insertAtCaret(elem, '\t')
    }
}

function resetCaret(elem) {
    elem.selectionEnd = 0
}

function autoScroll(elem) {
    if (elem.selectionEnd == elem.value.length) {
        scrollToEnd(elem)
    }
}

//
// Utility functions: generalized logic.
// Only mutates passed-in elements.
//

function insertAtCaret(elem, text) {
    const selectionStart = elem.selectionStart
    elem.value = elem.value.slice(0, selectionStart) + text + elem.value.slice(elem.selectionEnd)
    elem.selectionStart = elem.selectionEnd = selectionStart + text.length
}

function scrollToEnd(elem) {
    elem.scrollTop = elem.scrollHeight
}
