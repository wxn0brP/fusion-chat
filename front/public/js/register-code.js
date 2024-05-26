const codeDiv = document.querySelector("#code");
const errDiv = document.querySelector("#err");

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = codeDiv.value;
    if(!code)
        return errDiv.innerHTML = "Code is required.";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/register-code", false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ code: code }));
    const res = JSON.parse(xhr.responseText);
    if(res.err)
        return errDiv.innerHTML = res.msg;

    location.href = "/login";
});