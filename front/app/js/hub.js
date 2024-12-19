const required = [
    "settingsServer_users",
    "var",
    "settingsServer_meta",
    "messStyle",
    "media",
    "utils",
    "settingsServer_utils",
    "translate",
    "format",
    "init",
    "popup",
    "settingsServer_roles",
    "settingsServer_webhooks",
    "apis",
    "features",
    "settingsServerLib",
    "file",
    "settingsServer_nav",
    "ws_evt",
    "contextMenu",
    "messCmd",
    "renders",
    "stateManager",
    "emoji",
    "warning",
    "messSocket",
    "contextMenuLib",
    "perm",
    "start",
    "genId",
    "mainView",
    "settingsLib",
    "mess",
    "settingsServer_channels",
    "debug",
    "settingsData",
    "uiFunc",
    "buttons",
    "settings",
    "voice",
    "ws",
    "settingsServer_emoji",
    "settingsServer_save",
    "swipeLib",
    "coreFunc",
];

const registered = [];

export default (name) => {
    if(registered.includes(name)) return;
    registered.push(name);
}

export const reqButNotReg = () => {
    return required.filter((module) => !registered.includes(module));
}

export const regButNotReq = () => {
    return registered.filter((module) => !required.includes(module));
}

export const getReq = () => {
    return required;
}

export const getReg = () => {
    return registered;
}