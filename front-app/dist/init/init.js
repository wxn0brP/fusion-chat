import cw from "../core.js";
import hub from "../hub.js";
hub("init");
if (!localStorage.getItem("token"))
    window.location.href = "/login";
document.querySelectorAll("[loadInner]").forEach(e => {
    e.innerHTML = cw.get(e.getAttribute("loadInner"));
});
document.querySelectorAll(".delete").forEach(e => {
    let time = parseInt(e.getAttribute("time"));
    setTimeout(() => e.remove(), time);
});
//# sourceMappingURL=init.js.map