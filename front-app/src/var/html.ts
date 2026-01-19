function mess() {
    const nav = qs("#messages_nav");

    return {
        div: qs("#messages"),
        input: qs<HTMLTextAreaElement>("#mess-input"),
        replyClose: qs("#replyClose"),
        editClose: qs("#editClose"),
        sendBtn: qs<HTMLButtonElement>("#barc__sendBtn"),
        linkClick: qs("#linkClick"),
        nav,
        nav_priv: nav.qs("#messages_nav__priv"),
        nav_realm: nav.qs("#messages_nav__realm"),
        sendBtnImg: qs<SVGElement>("#barc__sendBtn__img"),
        bar: qs("#bar"),
        barc__commads: qs("#barc__commads")
    }
}

function nav() {
    return {
        nav: qs("#navs"),
        priv: qs("#navs__priv"),
        realm: qs("#navs__realm"),
        main: qs("#navs__main"),
        realms: qs("#navs__realms"),
        main__call: qs("#navs__main__call"),
        navs__user: qs("#navs__user"),
        user__name: qs("#navs__user__name"),
        user__status: qs("#navs__user__status"),
        realm__name: qs("#navs__realm__name"),
        realm__panel: qs("#navs__realm__panel"),
        realm__channels: qs("#navs__realm__channels"),
        realm__users: qs("#navs__realms__users"),
    }
}

function core() {
    return {
        messages_nav__realm__description: qs("#messages_nav__realm__description"),
    }
}

function render() {
    const events = qs("#realmEvents");
    return {
        navs__priv: qs("#navs__priv"),
        realms__content: qs("#realms__content"),
        userProfile: qs("#userProfile"),
        events,
        events__container: events.qs("#realmEvents__container"),
        events__add: events.qs("#realmEvents__add"),
        realmUserProfile: qs("#realmUserProfile"),
    }
}

function mainView() {
    const div = qs("#main__view");
    return {
        div,
        nav: qs("#main__view__nav"),
        friends: div.qs("#main__view__friends"),
        requests: div.qs("#main__view__requests"),
        requestCount: div.qs("#main__view__requests__count"),
        noFriends: div.qs("#main__view__noFriends"),
        noRequests: div.qs("#main__view__noRequests"),
        friendsContainer: div.qs("#main__view__friends_container"),
        requestsContainer: div.qs("#main__view__requests_container"),
    }
}

function other() {
    return {
        makeRealm: qs("#makeRealm"),
    }
}

function emoji() {
    return {
        div: qs("#emojiDiv"),
        input: qi("#emocji-input"),
        container: qs("#emoji__container"),
        nav: qs("#emoji__nav"),
    }
}

export const messHTML = mess();
export const navHTML = nav();
export const coreHTML = core();
export const renderHTML = render();
export const mainViewHTML = mainView();
export const otherHTML = other();
export const emojiHTML = emoji();

export const mglHTML = { // magistral for html variables
    mess: messHTML,
    nav: navHTML,
    core: coreHTML,
    render: renderHTML,
    mainView: mainViewHTML,
    other: otherHTML,
    emoji: emojiHTML
}

window.mglHTML = mglHTML;