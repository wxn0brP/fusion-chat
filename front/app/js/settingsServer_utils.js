SettingsServerManager.prototype.initCategoryElement = function(){
    const div = document.createElement("div");
    div.className = "settings__category";
    this.container.appendChild(div);
    return div;
}

SettingsServerManager.prototype.initInputText = function(container, label, defaultValue){
    const textInputContainer = document.createElement("div");
    textInputContainer.innerHTML = `<label>${label}</label>`;
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = defaultValue;
    textInputContainer.appendChild(inputElement);
    container.appendChild(textInputContainer);
    return inputElement;
}

SettingsServerManager.prototype.initButton = function(container, text, onclick){
    const button = document.createElement("button");
    button.innerHTML = text;
    button.onclick = onclick;
    button.style.marginInline = "3px";
    container.appendChild(button);
    return button;
}

SettingsServerManager.prototype.initCheckbox = function(container, label, defaultValue){
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

SettingsServerManager.prototype.addSeparator = function(container, x){
    const div = document.createElement("div");
    div.style.height = x+"px";
    container.appendChild(div);
}