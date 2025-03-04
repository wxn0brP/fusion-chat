import hub from "../hub.js";
hub("var/html");
function qd(selector, container) {
    return (container || document).querySelector(selector);
}
function mess() {
    const nav = qd("#messages_nav");
    return {
        div: qd("#messages"),
        input: document.querySelector("#mess-input"),
        replyClose: qd("#replyClose"),
        editClose: qd("#editClose"),
        sendBtn: document.querySelector("#barc__sendBtn"),
        linkClick: qd("#linkClick"),
        nav,
        nav_priv: qd("#messages_nav__priv", nav),
        nav_realm: qd("#messages_nav__realm", nav),
        sendBtnImg: document.querySelector("#barc__sendBtn__img"),
        bar: qd("#bar"),
        barc__commads: qd("#barc__commads")
    };
}
function nav() {
    return {
        nav: qd("#navs"),
        priv: qd("#navs__priv"),
        realm: qd("#navs__realm"),
        main: qd("#navs__main"),
        realms: qd("#navs__realms"),
        main__call: qd("#navs__main__call"),
        navs__user: qd("#navs__user"),
        user__name: qd("#navs__user__name"),
        user__status: qd("#navs__user__status"),
        realm__name: qd("#navs__realm__name"),
        realm__panel: qd("#navs__realm__panel"),
        realm__channels: qd("#navs__realm__channels"),
        realm__users: qd("#navs__realms__users"),
    };
}
function core() {
    return {
        messages_nav__realm__description: qd("#messages_nav__realm__description"),
    };
}
function render() {
    const events = qd("#realmEvents");
    return {
        navs__priv: qd("#navs__priv"),
        realms__content: qd("#realms__content"),
        userProfile: qd("#userProfile"),
        events,
        events__container: qd("#realmEvents__container", events),
        events__add: qd("#realmEvents__add", events),
        realmUserProfile: qd("#realmUserProfile"),
    };
}
function mainView() {
    const div = qd("#main__view");
    return {
        div,
        nav: qd("#main__view__nav"),
        friends: qd("#main__view__friends", div),
        requests: qd("#main__view__requests", div),
        requestCount: qd("#main__view__requests__count", div),
        noFriends: qd("#main__view__noFriends", div),
        noRequests: qd("#main__view__noRequests", div),
        friendsContainer: qd("#main__view__friends_container", div),
        requestsContainer: qd("#main__view__requests_container", div),
    };
}
function other() {
    return {
        makeRealm: qd("#makeRealm"),
    };
}
function voice() {
    return {
        div: qd("#voice_call"),
        mediaContainer: qd("#voice_call_media"),
        users: qd("#voice_call_users"),
        muteMic: qd("#voice_call_mute_mic"),
        voiceShow: qd("#realms__voice_show"),
    };
}
function emoji() {
    return {
        div: qd("#emojiDiv"),
        input: document.querySelector("#emocji-input"),
        container: qd("#emoji__container"),
        nav: qd("#emoji__nav"),
    };
}
export const messHTML = mess();
export const navHTML = nav();
export const coreHTML = core();
export const renderHTML = render();
export const mainViewHTML = mainView();
export const otherHTML = other();
export const voiceHTML = voice();
export const emojiHTML = emoji();
export const mglHTML = {
    mess: messHTML,
    nav: navHTML,
    core: coreHTML,
    render: renderHTML,
    mainView: mainViewHTML,
    other: otherHTML,
    voice: voiceHTML,
    emoji: emojiHTML
};
window.mglHTML = mglHTML;
//# sourceMappingURL=html.js.map