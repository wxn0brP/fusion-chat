document.querySelector("#nav__toggle").addEventListener("click", () => {
    const nav = document.querySelector("nav").style;
    nav.left = nav.left == "0px" ? "-360px" : "0px";
});

document.querySelector("#app").addEventListener("contextmenu", (e) => {
    e.preventDefault();
})

setupSwipe(
    document.body,
    () => {
        document.querySelector("nav").style.left = "-360px";
    },
    () => {
        document.querySelector("nav").style.left = "0px";
    },
    () => {
        // up
    },
    () => {
        // down
    }
);