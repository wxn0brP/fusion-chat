const required = [
    "apis",
    "file",
    "warning",
    "cacheControllers/socketGeneral",
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
    "socket/_evt",
    "socket/evt",
    "socket/mess",
    "socket/engine",
    "socket",
    "coreFunc",
    "debug",
    "features",
    "init",
    "start",
    "contextMenuLib",
    "swipeLib",
    "components/contextMenu",
    "components/emoji",
    "components/mainView",
    "components/media",
    "components/voice",
    "helpers/reloadImages",
    "helpers/stateManager",
    "helpers/uiFunc",
    "interact/context",
    "interact/mainView",
    "interact/relations",
    "interact/subscribeEventChnl",
    "interact/ui",
    "render/dm",
    "render/event",
    "render/realm",
    "render/realmInit",
    "render/user",
    "render/utils",
    "render/var",
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
    "genId",
    "perm",
    "translate",
    "utils",
    "var/api",
    "var/html",
    "var/keys",
    "var/staticData",
    "var",
];
const registered = [];
export default (name) => {
    if (registered.includes(name))
        return;
    registered.push(name);
};
export const reqButNotReg = () => {
    return required.filter((module) => !registered.includes(module));
};
export const regButNotReq = () => {
    return registered.filter((module) => !required.includes(module));
};
export const getReq = () => {
    return required;
};
export const getReg = () => {
    return registered;
};
//# sourceMappingURL=hub.js.map