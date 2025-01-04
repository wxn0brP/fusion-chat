import cw from "../core";
import hub from "../hub";
hub("init");

if (!localStorage.getItem("token")) window.location.href = "/login";

document.querySelectorAll("[loadInner]").forEach(e => {
    e.innerHTML = cw.get(e.getAttribute("loadInner"));
});

document.querySelectorAll(".delete").forEach(e => {
    let time = parseInt(e.getAttribute("time"));
    setTimeout(() => e.remove(), time);
});