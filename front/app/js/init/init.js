import hub from "../hub.js";
hub("init");

if(!localStorage.getItem("token")) window.location = "/login";

document.querySelectorAll("[loadInner]").forEach(e => {
    e.innerHTML = cw.get(e.getAttribute("loadInner"));
});

document.querySelectorAll(".delete").forEach(e => {
    let time = parseInt(e.getAttribute("time"));
    setTimeout(()=>e.remove(), time);
});