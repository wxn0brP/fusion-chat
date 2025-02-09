const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
if(!token)
    document.querySelector("#err").innerHTML = "Token is required.";

fetch("/api/account/delete/get?token="+token).then(res => res.json()).then(res => {
    if(res.err)
        return document.querySelector("#err").innerHTML = res.msg;

    document.querySelector("#user").innerHTML = res.name;
});

document.querySelector("button").addEventListener("click", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/account/delete/undo", false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ token }));

    const res = JSON.parse(xhr.responseText);
    if(res.err)
        return document.querySelector("#err").innerHTML = res.msg;

    location.href = "/";
});