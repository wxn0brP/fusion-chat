function locationNext(){
    let urlParam = new URLSearchParams(location.search);
    urlParam = urlParam.get("next");
    let next = "/app";
    if(urlParam){
        next = window.location.protocol + "//" + window.location.host;
        if(!urlParam.startsWith("/")) urlParam = "/" + urlParam;
        next += urlParam;
    }
    location.href = next;
}

function loginW(){
    const urlParam = new URLSearchParams(location.search);
    if(urlParam.get("err")) return;
    if(
        localStorage.getItem("rToken") &&
        localStorage.getItem("from") &&
        localStorage.getItem("user_id")
    ){
        locationNext();
    }
}
loginW();

const s_id = createCode();
qrcodeC(location.protocol + '//' + location.host + "/qrCodeLogin?k=" + s_id);
const socket = io("/qrCodeLogin", {
    auth: {
        role: "get",
        id: s_id
    }
});
socket.connect();
socket.on("get", (token, from, user_id) => {
    localStorage.setItem("rToken", token);
    localStorage.setItem("from", from);
    localStorage.setItem("user_id", user_id);
    locationNext();
});

const loginDiv = document.querySelector("#login");
const passDiv = document.querySelector("#pass");
const errDiv = document.querySelector("#err");

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    let login = loginDiv.value;
    if(!login){
        errDiv.html("Login nie może być pusty");
        return;
    }
    let pass = passDiv.value;
    if(!pass){
        errDiv.html("Hasło nie może być puste");
        return;
    }
    login = login.trim();
    pass = pass.trim();

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/login", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ name: login, password: pass }));
    let res = xhr.responseText;
    try{
        res = JSON.parse(res);
        if(res.err){
            errDiv.innerHTML = res.msg;
            return;
        }
        localStorage.setItem("from", res.from);
        localStorage.setItem("user_id", res.user_id);
        localStorage.setItem("token", res.token);
        locationNext();
    }catch(e){
        alert(`Login error! Code ${xhr.status}.`);
        console.log(res, e);
    }
});

function qrcodeC(url){
    const qrD = document.querySelector("#qrcode-qr");
    qrD.innerHTML = "";
    const qrcode = new QRCode(qrD, {
        width: 364,
        height: 364,
        correctLevel : QRCode.CorrectLevel.H
    });
    qrcode.makeCode(url);
    document.querySelector("#qrcode-qr canvas").classList = "s m_12 l_12 u_12"
    document.querySelector("#qrcode-qr img").classList = "s m_12 l_12 u_12"
}

function createCode(){
    let id = "";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(let i=0; i<15; i++) id += characters.charAt(Math.floor(Math.random() * characters.length));
    return id;
}

function changeCodeStatus(opn){
    document.querySelector("#qrcode-div").style.display = opn ? "block" : "none";
    document.querySelector("#loginC").style.display = !opn ? "" : "none";
}