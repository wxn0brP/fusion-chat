function mess(){
    const nav = document.querySelector("#messages_nav");

    return {
        div: document.querySelector("#messages"),
        input: messInput,
        inputRaw: document.querySelector("#mess-input"),
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

const messInput = new Proxy(document.querySelector("#mess-input"), {
    get(target, prop){
        if(prop === "value"){
            const data = Array.from(target.childNodes)
            .map((node) => {
                if(node.nodeType === Node.TEXT_NODE) return node.textContent;
                if(node.nodeName === "BR") return "\n";
                if(node.nodeName === "DIV") return node.textContent + "\n";
                return "";
            })
            .join("")
            return data;
        }else
        if(prop === "selectionStart" || prop === "selectionEnd"){
            const selection = window.getSelection();
            if(selection.rangeCount === 0 || !target.contains(selection.anchorNode)){
                return 0;
            }
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(target);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            return preCaretRange.toString().length;
        }else
        if(prop === "setSelectionRange"){
            return (start, end) => {
                const range = document.createRange();
                const selection = window.getSelection();
                let charIndex = 0;
                const nodeStack = [target];
                let node, foundStart = false, stop = false;

                while((node = nodeStack.pop()) && !stop){
                    if(node.nodeType === Node.TEXT_NODE){
                        const nextCharIndex = charIndex + node.length;
                        if(!foundStart && start >= charIndex && start <= nextCharIndex){
                            range.setStart(node, start - charIndex);
                            foundStart = true;
                        }
                        if(foundStart && end >= charIndex && end <= nextCharIndex){
                            range.setEnd(node, end - charIndex);
                            stop = true;
                        }
                        charIndex = nextCharIndex;
                    }else{
                        for(let i = node.childNodes.length - 1; i >= 0; i--){
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
    set(target, prop, value){
        if(prop === "value"){
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