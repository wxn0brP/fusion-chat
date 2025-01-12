import hub from "../hub";
import { MglInt, MglVar } from "../types/html";
hub("var/html");

function qd(selector: string, container?: HTMLElement) {
    return (container || document).querySelector<HTMLDivElement>(selector);
}

function mess() {
    const nav = qd("#messages_nav");

    return {
        div: qd("#messages"),
        input: document.querySelector<HTMLTextAreaElement>("#mess-input"),
        replyClose: qd("#replyClose"),
        editClose: qd("#editClose"),
        sendBtn: document.querySelector<HTMLButtonElement>("#barc__sendBtn"),
        linkClick: qd("#linkClick"),
        nav,
        nav_priv: qd("#messages_nav__priv", nav),
        nav_realm: qd("#messages_nav__realm", nav),
        sendBtnImg: document.querySelector<SVGElement>("#barc__sendBtn__img"),
        bar: qd("#bar"),
        barc__commads: qd("#barc__commads")
    }
}

function nav() {
    return {
        nav: qd("#navs"),
        priv: qd("#navs__priv"),
        realm: qd("#navs__realm"),
        main: qd("#navs__main"),
        realms: qd("#navs__realms"),
        main__call: qd("#navs__main__call"),
        user__name: qd("#navs__user__name"),
        user__status: qd("#navs__user__status"),
        realms__name: qd("#navs__realms__name"),
        realms__channels: qd("#navs__realms__channels"),
        realms__users: qd("#navs__realms__users"),
    }
}

function core() {
    return {
        emojiStyle: qd("#emoji-style"),
        messages_nav__realm__description: qd("#messages_nav__realm__description"),
    }
}

function render() {
    return {
        navs__priv: qd("#navs__priv"),
        realms__content: qd("#realms__content"),
        userProfile: qd("#userProfile"),
    }
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
    }
}

function other() {
    return {
        makeRealm: qd("#makeRealm"),
    }
}

function voice() {
    return {
        div: qd("#voice_call"),
        mediaContainer: qd("#voice_call_media"),
        users: qd("#voice_call_users"),
        muteMic: qd("#voice_call_mute_mic"),
        voiceShow: qd("#realms__voice_show"),
    }
}

function emoji() {
    return {
        div: qd("#emojiDiv"),
        input: document.querySelector("#emocji-input") as HTMLInputElement,
        container: qd("#emoji__container"),
        nav: qd("#emoji__nav"),
    }
}

const messInput = new Proxy(document.querySelector("#mess-input"), {
    get(target, prop) {
        if (prop === "value") {
            const data = Array.from(target.childNodes)
                .map((node) => {
                    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
                    if (node.nodeName === "BR") return "\n";
                    if (node.nodeName === "DIV") return node.textContent + "\n";
                    return "";
                })
                .join("")
            return data;
        } else
            if (prop === "selectionStart" || prop === "selectionEnd") {
                const selection = window.getSelection();
                if (selection.rangeCount === 0 || !target.contains(selection.anchorNode)) {
                    return 0;
                }
                const range = selection.getRangeAt(0);
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(target);
                preCaretRange.setEnd(range.startContainer, range.startOffset);
                return preCaretRange.toString().length;
            } else
                if (prop === "setSelectionRange") {
                    return (start, end) => {
                        const range = document.createRange();
                        const selection = window.getSelection();
                        let charIndex = 0;
                        const nodeStack = [target];
                        let node, foundStart = false, stop = false;

                        while ((node = nodeStack.pop()) && !stop) {
                            if (node.nodeType === Node.TEXT_NODE) {
                                const nextCharIndex = charIndex + node.length;
                                if (!foundStart && start >= charIndex && start <= nextCharIndex) {
                                    range.setStart(node, start - charIndex);
                                    foundStart = true;
                                }
                                if (foundStart && end >= charIndex && end <= nextCharIndex) {
                                    range.setEnd(node, end - charIndex);
                                    stop = true;
                                }
                                charIndex = nextCharIndex;
                            } else {
                                for (let i = node.childNodes.length - 1; i >= 0; i--) {
                                    nodeStack.push(node.childNodes[i]);
                                }
                            }
                        }
                        selection.removeAllRanges();
                        selection.addRange(range);
                    };
                }
        return target[prop];
    },
    set(target, prop, value) {
        if (prop === "value") {
            target.innerHTML = value
                .split("\n")
                .map((line) => (line === "" ? "<br>" : line))
                .join("");
            return true;
        }
        target[prop] = value;
        return true;
    },
});

export const messHTML = mess();
export const navHTML = nav();
export const coreHTML = core();
export const renderHTML = render();
export const mainViewHTML = mainView();
export const otherHTML = other();
export const voiceHTML = voice();
export const emojiHTML = emoji();

export const mglHTML = { // magistral for html variables
    mess: messHTML,
    nav: navHTML,
    core: coreHTML,
    render: renderHTML,
    mainView: mainViewHTML,
    other: otherHTML,
    voice: voiceHTML,
    emoji: emojiHTML
}

export const mglInt: MglInt = {} // magistral for interactions functions

export const mglVar: MglVar = {} // magistral for variables

window.mglHTML = mglHTML;
window.mglInt = mglInt;
window.mglVar = mglVar;