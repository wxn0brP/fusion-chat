// @ts-check
import hub from "../../../hub.js";
hub("rs/utils");

/**
 * Initializes a new settings category element
 * @param {HTMLElement} container the container to append to. If not provided, will not append.
 * @returns {HTMLElement} the initialized element
 */
export const initCategoryElement = function(container){
    const div = document.createElement("div");
    div.className = "settings__category";
    if(container) container.appendChild(div);
    return div;
}

/**
 * Initializes a text input element with the given label and default value.
 * @param {HTMLElement} container the container to append to. If not provided, will not append.
 * @param {string} label the label to display for the input
 * @param {string} defaultValue the default text value of the input
 * @returns {HTMLInputElement} the input element
 */
export const initInputText = function(container, label, defaultValue){
    const textInputContainer = document.createElement("div");
    textInputContainer.innerHTML = `<label>${label}</label>`;
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = defaultValue;
    textInputContainer.appendChild(inputElement);
    container.appendChild(textInputContainer);
    return inputElement;
}

/**
 * Creates a button element with the specified text and click handler, and appends it to the given container.
 *
 * @param {HTMLElement} container - The container element to which the button will be appended.
 * @param {string} text - The text to display on the button.
 * @param {Function} onclick - The function to be called when the button is clicked.
 * @returns {HTMLButtonElement} - The created button element.
 */

export const initButton = function(container, text, onclick){
    const button = document.createElement("button");
    button.innerHTML = text;
    // @ts-ignore
    button.onclick = onclick;
    button.style.marginInline = "3px";
    container.appendChild(button);
    return button;
}

/**
 * Initializes a checkbox with an optional label and appends it to the given container.
 * 
 * @param {HTMLElement} container - The container element to which the checkbox will be appended.
 * @param {string} label - The text label for the checkbox.
 * @param {boolean} [defaultValue=false] - The initial checked state of the checkbox.
 * @returns {HTMLInputElement} - The initialized checkbox input element.
 */

export const initCheckbox = function(container, label, defaultValue){
    const checkboxContainer = document.createElement("div");
    checkboxContainer.style.marginBottom = "3px";

    const inputElement = document.createElement("input");
    inputElement.type = "checkbox";
    inputElement.checked = defaultValue || false;
    inputElement.classList.add("checkbox_switch");
    checkboxContainer.appendChild(inputElement);
    
    const labelElement = document.createElement("label");
    labelElement.innerHTML = label;
    checkboxContainer.appendChild(labelElement);

    container.appendChild(checkboxContainer);
    return inputElement;
}

/**
 * Adds a separator to the given container. If no container is provided, the separator is not appended to anything.
 * @param {HTMLElement} [container] the container to append to. If not provided, the separator is not appended to anything.
 * @param {number} [x=0] the height of the separator in pixels.
 * @returns {HTMLElement} the separator element
 */
export const addSeparator = function(container=undefined, x=0){
    const div = document.createElement("div");
    div.style.height = x+"px";
    if(container) container.appendChild(div);
    return div;
}