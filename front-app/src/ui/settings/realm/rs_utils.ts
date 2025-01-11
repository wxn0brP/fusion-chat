import hub from "../../../hub";
hub("rs/utils");

/**
 * Initializes a new settings category element
 */
export const initCategoryElement = function (container: HTMLElement) {
    const div = document.createElement("div");
    div.className = "settings__category";
    if (container) container.appendChild(div);
    return div;
}

/**
 * Initializes a text input element with the given label and default value.
 */
export const initInputText = function (container: HTMLElement, label: string, defaultValue: string) {
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
 */

export const initButton = function (container: HTMLElement, text: string, onclick: () => void) {
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
 */

export const initCheckbox = function (container: HTMLElement, label: string, defaultValue: boolean) {
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
 * @param [container] the container to append to. If not provided, the separator is not appended to anything.
 * @param [x=0] the height of the separator in pixels.
 */
export const addSeparator = function (container: HTMLElement = undefined, x: number = 0) {
    const div = document.createElement("div");
    div.style.height = x + "px";
    if (container) container.appendChild(div);
    return div;
}