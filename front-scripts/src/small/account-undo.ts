import "@wxn0brp/flanker-ui/html";

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
if (!token)
    qs("#err").innerHTML = "Token is required.";

fetch("/api/account/delete/get?token=" + token).then(res => res.json()).then(res => {
    if (res.err)
        return qs("#err").innerHTML = res.msg;

    qs("#user").innerHTML = res.name;
});

qs("button").addEventListener("click", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/account/delete/undo", false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ token }));

    const res = JSON.parse(xhr.responseText);
    if (res.err)
        return qs("#err").innerHTML = res.msg;

    location.href = "/";
});