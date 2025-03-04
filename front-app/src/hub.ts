const required = [
//  api
    "apis",
    "file",
//  common
    "warning",
//  core
    // cacheControllers
        "cacheControllers/socketGeneral",
    // mess
        // format
            "mess/format/embed",
            "mess/format/list",
            "mess/format/media",
            "mess/format/respone",
            "mess/format/table",
            "mess/format/text",
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
        "socket/engine",
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
        "components/contextMenu",
        "components/emoji",
        "components/mainView",
        "components/media",
        "components/realmUserProfile",
        "components/voice",
    // helpers
        "helpers/reloadImages",
        "helpers/stateManager",
        "helpers/uiFunc",
    // interact
        "interact/context",
        "interact/mainView",
        "interact/realmUser",
        "interact/relations",
        "interact/subscribeEventChnl",
        "interact/ui",
    // render
        "render/dm",
        "render/event",
        "render/realm",
        "render/realmInit",
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
    "var/api",
    "var/html",
    "var/keys",
    "var/staticData",
    "var",
];

const registered: string[] = [];

export default (name: string) => {
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