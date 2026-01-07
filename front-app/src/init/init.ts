if (!localStorage.getItem("token")) window.location.href = "/login";

document.querySelectorAll(".delete").forEach(e => {
    let time = parseInt(e.getAttribute("time"));
    setTimeout(() => e.remove(), time);
});

export { }