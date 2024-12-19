function mess(){
    const nav = document.querySelector("#messages_nav");

    return {
        div: document.querySelector("#messages"),
        input: document.querySelector("#mess-input"),
        replyClose: document.querySelector("#replyClose"),
        editClose: document.querySelector("#editClose"),
        sendBtn: document.querySelector("#barc__sendBtn"),
        linkClick: document.querySelector("#linkClick"),
        nav,
        nav_priv: nav.querySelector("#messages_nav__priv"),
        nav_realm: nav.querySelector("#messages_nav__realm"),
        sendBtnImg: document.querySelector("#barc__sendBtn__img"),
        bar: document.querySelector("#bar"),
    }
}

function nav(){
    return {
        nav: document.querySelector("#navs"),
        priv: document.querySelector("#navs__priv"),
        realm: document.querySelector("#navs__realm"),
        main: document.querySelector("#navs__main"),
        realms: document.querySelector("#navs__realms"),
        main__call: document.querySelector("#navs__main__call"),
        user__name: document.querySelector("#navs__user__name"),
        user__status: document.querySelector("#navs__user__status"),
        realms__name: document.querySelector("#navs__realms__name"),
        realms__channels: document.querySelector("#navs__realms__channels"),
        realms__users: document.querySelector("#navs__realms__users"),
    }
}

function core(){
    return {
        emojiStyle: document.querySelector("#emoji-style"),
        messages_nav__realm__description: document.querySelector("#messages_nav__realm__description"),
    }
}

function render(){
    return {
        navs__priv: document.querySelector("#navs__priv"),
        realms__content: document.querySelector("#realms__content"),
        userProfile: document.querySelector("#userProfile"),
    }
}

function mainView(){
    const div = document.querySelector("#main__view");
    return {
        div,
        nav: document.querySelector("#main__view__nav"),
        friends: div.querySelector("#main__view__friends"),
        requests: div.querySelector("#main__view__requests"),
        requestCount: div.querySelector("#main__view__requests__count"),
        noFriends: div.querySelector("#main__view__noFriends"),
        noRequests: div.querySelector("#main__view__noRequests"),
        friendsContainer: div.querySelector("#main__view__friends_container"),
        requestsContainer: div.querySelector("#main__view__requests_container"),
    }
}

function other(){
    return {
        makeRealm: document.querySelector("#makeRealm"),
    }
}

function voice(){
    return {
        div: document.querySelector("#voice_call"),
        mediaContainer: document.querySelector("#voice_call_media"),
        users: document.querySelector("#voice_call_users"),
        muteMic: document.querySelector("#voice_call_mute_mic"),
        voiceShow: document.querySelector("#realms__voice_show"),
    }
}

function emoji(){
    return {
        div: document.querySelector("#emojiDiv"),
        input: document.querySelector("#emocji-input"),
        container: document.querySelector("#emoji__container"),
        nav: document.querySelector("#emoji__nav"),
    }
}

export const messHTML = mess();
export const navHTML = nav();
export const coreHTML = core();
export const renderHTML = render();
export const mainViewHTML = mainView();
export const otherHTML = other();
export const voiceHTML = voice();
export const emojiHTML = emoji();

export const magistral = {
    messHTML,
    navHTML,
    coreHTML,
    renderHTML,
    mainViewHTML,
    otherHTML,
    voiceHTML,
    emojiHTML
}
window.magistral = magistral;