// Theme picker: Light, Dark, or System default
//
// This file is loaded in <head> WITHOUT defer on purpose: it has to set the theme before
// the page is first drawn. A deferred script can run after the page has already been
// painted, which shows up as a flash of the wrong colors on every page load.

const themeKey = "theme";
const fadeTime = 400; // milliseconds; keep in step with the transition in css/styles.css
let fadeTimer;

function readSavedTheme() {
    try {
        return localStorage.getItem(themeKey);
    } catch (error) {
        return null;
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem(themeKey, theme);
    } catch (error) {
        console.warn("The theme preference could not be saved.");
    }
}

// Returns "light", "dark", or "system". Anything else, including nothing saved yet,
// counts as "system".
function savedChoice() {
    const theme = readSavedTheme();
    if (theme === "light" || theme === "dark") {
        return theme;
    }
    return "system";
}

// "light" and "dark" force a theme with <html data-theme="...">. "system" removes the
// attribute, so the stylesheet's color-scheme: light dark follows the device's setting,
// even if that setting changes while the page is open.
function applyTheme(theme) {
    if (theme === "system") {
        delete document.documentElement.dataset.theme;
    } else {
        document.documentElement.dataset.theme = theme;
    }

    // The picker doesn't exist yet the first time this runs, because the browser hasn't
    // read <body> at that point.
    const picker = document.querySelector("#theme-picker");
    if (picker) {
        picker.value = theme;
    }
}

// Fades the colors for a moment. The theme-fade class switches on the transitions in the
// stylesheet only while the theme changes, so hover effects and page loads stay instant.
function fadeColors() {
    document.documentElement.classList.add("theme-fade");
    clearTimeout(fadeTimer); // picking twice quickly restarts the timer
    fadeTimer = setTimeout(function () {
        document.documentElement.classList.remove("theme-fade");
    }, fadeTime);
}

applyTheme(savedChoice());

// Once the HTML has been read the picker exists: select the current choice, make it
// work, and reveal it.
document.addEventListener("DOMContentLoaded", function () {
    const picker = document.querySelector("#theme-picker");

    picker.addEventListener("change", function () {
        fadeColors();
        applyTheme(picker.value); // applied first, so switching works even if saving fails
        saveTheme(picker.value);
    });

    picker.value = savedChoice();
    picker.parentElement.hidden = false;
});

// The Back button can bring a page back exactly as it was left, old theme included.
// event.persisted is true in that case, so read the saved choice again.
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        applyTheme(savedChoice());
    }
});
