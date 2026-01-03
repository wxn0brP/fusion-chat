import "@wxn0brp/flanker-ui/html";

const realmInp = qi("#realm");
const chnlInp = qi("#channel");
const messages = qs("#messages");
const loadMore = qs<HTMLButtonElement>("#loadMore");
const messageStep = 20;
let actualMessages = 0;
let users = {}
let actualRealm = null;
let actualChnl = null;

qs("form").addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit();
});

loadMore.addEventListener("click", () => {
    loadMessages(actualRealm, actualChnl, actualMessages, actualMessages + messageStep);
});

function handleSubmit() {
    actualRealm = realmInp.value;
    actualChnl = chnlInp.value;
    messages.innerHTML = "";
    actualMessages = 0;
    loadMore.disabled = false;
    loadMessages(actualRealm, actualChnl, 0, messageStep);
}

function loadMessages(realm, chnl, start, end) {
    const sendData = {
        realm,
        chnl,
        start,
        end
    }
    const path = "/api/announcement?";
    const url = path + new URLSearchParams(sendData);
    fetch(url, {
        headers: {
            "Content-Type": "application/json",
        },
    }).then(res => res.json()).then(async res => {
        if (res.err) {
            alert("Something went wrong. Issue please.");
            console.log(res.msg);
            return;
        }

        const data = res.data;
        if (data.length == 0) {
            const p = document.createElement("p");
            p.textContent = "No more messages";
            messages.insertBefore(p, messages.firstChild);
            loadMore.disabled = true;
            return;
        }
        for (const msg of data) {
            await renderMessage(msg);
        }
        actualMessages += data.length;
    }).catch(err => {
        alert("Something went wrong. Issue please.");
        console.log(err);
    });
}

async function renderMessage(msg) {
    const section = document.createElement("section");

    const author = document.createElement("h3");
    author.textContent = await changeIdToName(msg.fr);
    section.appendChild(author);

    const message = document.createElement("article");
    formatFunc.formatMess(msg.msg, message);
    section.appendChild(message);

    messages.insertBefore(section, messages.firstChild);
}

async function changeIdToName(id: string) {
    if (users[id]) return users[id];
    const url = "/api/id/u?id=" + id + "&chat=" + actualRealm;
    const res = await fetch(url).then(res => res.json());

    if (res.err) return "error";
    users[id] = res.name;
    return res.name;
}

function loadUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    let chnl = null;
    let realm = null;

    if (urlParams.has("cc")) {
        let [chat, chnl] = urlParams.get("cc").split("_");
        realm = chat;
        chnl = chnl;
    }
    if (urlParams.has("realm")) realm = urlParams.get("realm");
    if (urlParams.has("r")) realm = urlParams.get("r");
    if (urlParams.has("chnl")) chnl = urlParams.get("chnl");
    if (urlParams.has("c")) chnl = urlParams.get("c");

    if (!realm || !chnl) return;
    realmInp.value = realm;
    chnlInp.value = chnl;
    handleSubmit();
}

loadUrlParams();

const messFunc = {
    linkClick(e) {
        e.preventDefault();
        const url = e.target.getAttribute("href");
        const confirm = window.confirm("Open link? (" + url + ")");
        if (!confirm) return;
        window.open(url, "_blank");
    },

    spoiler(e) {
        e.preventDefault();
        const t = e.target;
        t.classList.toggle("spoiler__show");
    }
}

const translateFunc = {
    get: (...args) => args.join(" "),
}