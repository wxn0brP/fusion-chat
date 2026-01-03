import { GLC } from "@wxn0brp/gloves-link-client";
declare const QRCode: any;
import "@wxn0brp/flanker-ui/html";

function locationNext() {
    let urlParam = new URLSearchParams(location.search).get("next");
    let next = "/app";
    if (urlParam) {
        next = window.location.protocol + "//" + window.location.host;
        if (!urlParam.startsWith("/")) urlParam = "/" + urlParam;
        next += urlParam;
    }
    location.href = next;
}

function loginW() {
    const urlParam = new URLSearchParams(location.search);
    if (urlParam.get("err")) return;
    if (
        localStorage.getItem("token") &&
        localStorage.getItem("from") &&
        localStorage.getItem("user_id")
    ) {
        locationNext();
    }
}
loginW();

const s_id = createCode();
const qrUrl = location.protocol + '//' + location.host + "/qr-code-login?k=" + s_id;
console.log("qrUrl", qrUrl);
qrcodeC(qrUrl);
const socket = new GLC("/qrCodeLogin", {
    connectionData: {
        role: "get",
        id: s_id,
        device: navigator.userAgent
    }
});

socket.on("get", (token, from, user_id) => {
    localStorage.setItem("token", token);
    localStorage.setItem("from", from);
    localStorage.setItem("user_id", user_id);
    locationNext();
});

const loginDiv = qi("#login");
const passDiv = qi("#pass");
const errDiv = qs("#err");

qs("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    let login = loginDiv.value;
    if (!login) {
        errDiv.html("Login is empty");
        return;
    }
    let pass = passDiv.value;
    if (!pass) {
        errDiv.html("Password is empty");
        return;
    }
    login = login.trim();
    pass = pass.trim();

    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: login, password: pass })
        });
        const json = await res.json();
        if (json.err) {
            errDiv.innerHTML = json.msg;
            return;
        }
        localStorage.setItem("from", json.from);
        localStorage.setItem("user_id", json.user_id);
        localStorage.setItem("token", json.token);
        locationNext();
    } catch (e) {
        alert(`Login error! Code ${e.status}`);
        console.log(e);
    }
});

function qrcodeC(url: string) {
    const qrD = qs("#qrcode-qr");
    qrD.innerHTML = "";
    const qrcode = new QRCode(qrD, {
        width: 364,
        height: 364,
        correctLevel: QRCode.CorrectLevel.H
    });
    qrcode.makeCode(url);
}

function createCode() {
    let id = "";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 15; i++) id += characters.charAt(Math.floor(Math.random() * characters.length));
    return id;
}

function changeCodeStatus(opn: boolean) {
    qs("#qrcode-div").style.display = opn ? "block" : "none";
    qs("#loginC").style.display = !opn ? "" : "none";
}

(window as any).changeCodeStatus = changeCodeStatus;