import "@wxn0brp/flanker-ui/html";

const codeDiv = qi("#code");
const errDiv = qs("#err");

qs("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = codeDiv.value;
    if (!code)
        return errDiv.innerHTML = "Code is required.";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/register/verify", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ code: code }));
    const res = JSON.parse(xhr.responseText);
    if (res.err)
        return errDiv.innerHTML = res.msg;

    location.href = "/login";
});