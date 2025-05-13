document.querySelectorAll(".delete").forEach(e => {
    let time = parseInt(e.getAttribute("time"));
    setTimeout(() => e.remove(), time);
});

export {};