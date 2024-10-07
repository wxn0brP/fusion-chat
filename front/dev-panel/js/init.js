if(!localStorage.getItem("token")) window.location = "/login&next=/dev-panel";

window.onload = () => {
    document.querySelectorAll(".delete").forEach(e => {
        let time = parseInt(e.getAttribute("time"));
        setTimeout(()=>e.remove(), time);
    });
};