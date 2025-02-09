const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
if(!token)
    document.querySelector("#err").innerHTML = "Token is required.";

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = document.querySelector("#pass").value;
    if(!pass)
        return document.querySelector("#err").innerHTML = "Password is required.";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/account/delete/confirm", false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ pass: pass, token }));

    const res = JSON.parse(xhr.responseText);
    if(res.err)
        return document.querySelector("#err").innerHTML = res.msg;

    location.href = "/";
});