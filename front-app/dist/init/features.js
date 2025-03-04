import hub from "../hub.js";
hub("features");
import vars from "../var/var.js";
import messFunc from "../core/mess/mess.js";
import setupSwipe from "../lib/swipeLib.js";
import staticData from "../var/staticData.js";
import { navHTML } from "../var/html.js";
document.querySelector("#nav__toggle").addEventListener("click", () => {
    const nav = document.querySelector("nav").style;
    nav.left = nav.left == "0px" ? "-360px" : "0px";
});
document.querySelector("#navs__user img").src = "/api/profile/img?id=" + vars.user._id;
navHTML.navs__user.setAttribute("data-status-id", vars.user._id);
document.querySelector("#app").addEventListener("contextmenu", (e) => {
    const target = e.target;
    const tag = target.tagName.toLowerCase();
    if (staticData.contextmenuTags.includes(tag))
        return;
    e.preventDefault();
});
setupSwipe(document.body, () => {
    document.querySelector("nav").style.left = "-360px";
}, () => {
    document.querySelector("nav").style.left = "0px";
}, () => {
}, () => {
});
(function initDragAndDrop() {
    const app = document.querySelector("#app");
    app.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
    });
    app.addEventListener("dragenter", function (e) {
        e.preventDefault();
        e.stopPropagation();
    });
    app.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (vars.chat.to == "main")
            return;
        const files = e.dataTransfer.files;
        for (const file of files) {
            messFunc.sendFile(file);
        }
    });
})();
//# sourceMappingURL=features.js.map