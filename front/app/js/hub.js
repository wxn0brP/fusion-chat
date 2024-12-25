const required = [
//  api
    "apis",
    "file",
//  common
    "warning",
//  core
    // mess
        "mess/cmd",
        "format",
        "mess/listeners",
        "mess",
        "mess/socket",
        "mess/style",
    // socket
        "socket/_evt",
        // logic
            "socket/evt",
            "socket/mess",
        "socket",
    "coreFunc",
    "debug",
//  "init",
    "features",
    "init",
    "start",
//  "lib",
    "contextMenuLib",
    "swipeLib",
//  ui
    // components
        "buttons",
        "contextMenu",
        "emoji",
        "mainView",
        "media",
        "popup",
        "renders",
        "voice",
    // helpers
        "stateManager",
        "uiFunc",
    // settings
        // realm
            "realmSettings",
            "rs_channels",
            "rs_emoji",
            "rs_meta",
            "rs_nav",
            "rs_roles",
            "rs_save",
            "rs_users",
            "rs_utils",
            "rs_webhooks",
        "settings",
        "settingsData",
        "settingsLib",
//  utils
    "genId",
    "perm",
    "translate",
    "utils",
//  var
    "var",
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