export type Settings_settingsManager__type = "checkbox" | "text" | "select" | "button" | "hr" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

export interface Settings_settingsManager__settings_base {
    name?: string;
    txt?: string;
    type: Settings_settingsManager__type;
    defaultValue?: any;
    css?: string | Object;
    only?: string | string[];
}

export interface Settings_settingsManager__settings_checkbox extends Settings_settingsManager__settings_base {
    type: "checkbox";
    defaultValue?: boolean;
}

export interface Settings_settingsManager__settings_text extends Settings_settingsManager__settings_base {
    type: "text";
    defaultValue?: string;
}

export interface Settings_settingsManager__settings_select extends Settings_settingsManager__settings_base {
    type: "select";
    defaultValue?: string;
    options: string[];
}

export interface Settings_settingsManager__settings_button extends Settings_settingsManager__settings_base {
    type: "button";
    onclick: () => void;
}

export type Settings_settingsManager__settings =
    Settings_settingsManager__settings_base |
    Settings_settingsManager__settings_checkbox |
    Settings_settingsManager__settings_text |
    Settings_settingsManager__settings_select |
    Settings_settingsManager__settings_button;

export interface Settings_settingsManager__category_base {
    name: string;
    txt?: string;
    type: "obj" | "fn";
    only?: string | string[];
}

export interface Settings_settingsManager__category_obj extends Settings_settingsManager__category_base {
    type: "obj";
    settings: Settings_settingsManager__settings[];
}

export interface Settings_settingsManager__fns{
    createButton: (Settings_settingsManager__settings_button) => HTMLButtonElement;
    createCheckbox: (Settings_settingsManager__settings_checkbox) => HTMLInputElement;
    createTextInput: (Settings_settingsManager__settings_text) => HTMLInputElement;
    createSelectInput: (Settings_settingsManager__settings_select) => HTMLSelectElement;
}

export interface Settings_settingsManager__category_fn extends Settings_settingsManager__category_base {
    type: "fn";
    settings: (settings: Settings_settingsManager__fns) => [HTMLDivElement, any];
    save: (element: HTMLDivElement, tmpData: any) => void;
}

export type Settings_settingsManager__category = Settings_settingsManager__category_obj | Settings_settingsManager__category_fn;

export interface Settings_settingsManager__saveFn {
    div: HTMLDivElement;
    tmpData: any;
    save: (div: HTMLDivElement, tmpData: any) => any;
}