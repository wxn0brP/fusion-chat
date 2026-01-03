import "@wxn0brp/flanker-ui/html";

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
if (!token)
    qs("#err").innerHTML = "Token is required.";

qs("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = qi("#pass").value;
    if (!pass)
        return qs("#err").innerHTML = "Password is required.";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/account/delete/confirm", false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ pass: pass, token }));

    const res = JSON.parse(xhr.responseText);
    if (res.err)
        return qs("#err").innerHTML = res.msg;

    location.href = "/";
});