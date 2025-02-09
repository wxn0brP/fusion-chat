import hub from "../../../hub.js";
hub("rs/utils");
export const initCategoryElement = function (container) {
    const div = document.createElement("div");
    div.className = "settings__category";
    if (container)
        container.appendChild(div);
    return div;
};
export const initInputText = function (container, label, defaultValue) {
    const textInputContainer = document.createElement("div");
    textInputContainer.innerHTML = `<label>${label}</label>`;
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = defaultValue;
    textInputContainer.appendChild(inputElement);
    container.appendChild(textInputContainer);
    return inputElement;
};
export const initButton = function (container, text, onclick) {
    const button = document.createElement("button");
    button.innerHTML = text;
    button.onclick = onclick;
    button.style.marginInline = "3px";
    container.appendChild(button);
    return button;
};
export const initCheckbox = function (container, label, defaultValue) {
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
};
export const addSeparator = function (container = undefined, x = 0) {
    const div = document.createElement("div");
    div.style.height = x + "px";
    if (container)
        container.appendChild(div);
    return div;
};
//# sourceMappingURL=rs_utils.js.map