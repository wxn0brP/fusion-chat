import hub from "../../../hub.js";
hub("rs_utils");

export const initCategoryElement = function(){
    const div = document.createElement("div");
    div.className = "settings__category";
    this.container.appendChild(div);
    return div;
}

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

export const initButton = function(container, text, onclick){
    const button = document.createElement("button");
    button.innerHTML = text;
    button.onclick = onclick;
    button.style.marginInline = "3px";
    container.appendChild(button);
    return button;
}

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

export const addSeparator = function(container, x){
    const div = document.createElement("div");
    div.style.height = x+"px";
    container.appendChild(div);
}