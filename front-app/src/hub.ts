const required = [
//  api
    "apis",
    "file",
//  common
    "warning",
//  core
    // mess
        "mess/cmd",
        "mess/format",
        "mess/interact",
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
        "contextMenu",
        "emoji",
        "mainView",
        "media",
        "voice",
    // helpers
        "stateManager",
        "uiFunc",
    // interact
        "interact/context",
        "interact/mainView",
        "interact/relations",
        "interact/subscribeEventChnl",
        "interact/ui",
    // render
        "render/dm",
        "render/realm",
        "render/realmInit",
        "render/socket",
        "render/user",
        "render/utils",
        "render/var",
    // settings
        // realm
            "realmSettings",
            "rs/channels",
            "rs/emoji",
            "rs/meta",
            "rs/nav",
            "rs/roles",
            "rs/save",
            "rs/users",
            "rs/utils",
            "rs/var",
            "rs/webhooks",
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