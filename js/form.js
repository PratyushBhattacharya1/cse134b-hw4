// Enhancements for form-with-js.html
// The form already validates and submits with HTML alone. This script adds:
//   1. specific error messages, using the Constraint Validation API
//   2. a character counter for the comment
//   3. a history of failed submit attempts, sent along with the form

const form = document.querySelector("form");
const fields = form.querySelectorAll(".form-field"); // name, email, comment
const comment = document.querySelector("#comment");
const infoArea = document.querySelector("info-area");
const errorArea = document.querySelector("error-area");
const countText = document.querySelector("#comment-count");
const warningText = document.querySelector("#comment-warning");
const historyField = document.querySelector("#form-errors");

const warningThreshold = 100; // start warning when this many characters are left
const form_errors = []; // one entry per invalid field, per failed submit attempt

// Changes an element's text only when it is really different. The messages sit in polite
// live regions, and rewriting identical text can make a screen reader repeat itself.
function setText(element, text) {
    if (element.textContent !== text) {
        element.textContent = text;
    }
}

// Checks one field using the Constraint Validation API.
// Returns the message to show, or "" when the field is valid.
function checkField(field) {
    // Clear the old message first. While a custom message is set the browser treats the
    // field as invalid, so a stale one would stop a corrected form from submitting.
    field.setCustomValidity("");

    let message = "";
    if (field.validity.valueMissing) {
        message = `Please enter your ${field.name}.`;
    } else if (field.validity.typeMismatch) {
        message = `Your ${field.name} must look like name@example.com.`;
    } else if (field.validity.tooShort) {
        message = `Your ${field.name} must be at least ${field.minLength} characters long.`;
    } else if (!field.validity.valid) {
        message = `Please check your ${field.name}.`; // anything else the browser objects to
    }

    // The browser shows this same message in its own popup when it blocks a submit.
    field.setCustomValidity(message);
    return message;
}

for (const field of fields) {
    const errorLine = document.querySelector(`#${field.id}-error`);
    let touched = false; // true once this field has been typed in or has failed a submit

    // Typing: keep the field's validity current, and update or remove an error that is
    // already on screen. New errors never appear while someone is still typing.
    field.addEventListener("input", function () {
        touched = true;
        const message = checkField(field);
        if (errorLine.textContent !== "") {
            setText(errorLine, message);
        }
    });

    // Leaving a field that has been touched: show whatever is wrong with it now.
    field.addEventListener("blur", function () {
        if (touched) {
            setText(errorLine, checkField(field));
        }
    });

    // The browser fires "invalid" on every invalid field when it blocks a submit attempt,
    // whether that came from the button or the Enter key. Nothing else in this file
    // triggers it, so each invalid field is recorded exactly once per failed attempt.
    field.addEventListener("invalid", function () {
        touched = true;
        const message = checkField(field);
        setText(errorLine, message);
        form_errors.push({ field: field.name, message: message });
    });
}

// "submit" only fires once every field is valid. Right before the form is sent, copy
// the history into the hidden form-errors field so it is posted with everything else.
form.addEventListener("submit", function () {
    historyField.value = JSON.stringify(form_errors);
});

// Character counter. The limit is read from the textarea's own maxlength attribute.
function updateCount() {
    const remaining = comment.maxLength - comment.value.length;

    let warning = "";
    if (remaining <= 0) {
        warning = "You have reached the limit, so no more text can be added.";
    } else if (remaining <= warningThreshold) {
        warning = "You are getting close to the limit.";
    }

    countText.textContent = `Characters remaining: ${remaining}.`;
    setText(warningText, warning);
    infoArea.classList.toggle("warning", warning !== "");
}

comment.addEventListener("input", updateCount);
updateCount();

// Everything is wired up, so switch the enhancements on. In the HTML the message areas are
// hidden and the history field is disabled (a disabled field is not submitted), so that
// nothing empty is shown or sent when JavaScript is off.
infoArea.hidden = false;
errorArea.hidden = false;
historyField.disabled = false;
form.classList.add("enhanced");
