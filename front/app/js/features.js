document.querySelector("#nav__toggle").addEventListener("click", () => {
    const nav = document.querySelector("nav").style;
    nav.left = nav.left == "0px" ? "-360px" : "0px";
});

document.querySelector("#navs__user img").src = "/api/profileImg?id=" + vars.user._id;

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

messInput.addEventListener("paste", function(e){
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    
    for(const item of items){
        if(item.type.indexOf("image") === -1) continue;
        e.preventDefault();
        messFunc.sendFile(item.getAsFile())
    };
});

(function initDragAndDrop(){
    const app = document.querySelector("#app");
    app.addEventListener("dragover", function(e){
        e.preventDefault();
        e.stopPropagation();
    });

    app.addEventListener("dragenter", function(e){
        e.preventDefault();
        e.stopPropagation();
    });

    app.addEventListener("drop", function(e){
        e.preventDefault();
        e.stopPropagation();

        if(vars.chat.to == "main") return;

        const files = e.dataTransfer.files;
        for(const file of files){
            messFunc.sendFile(file);
        }
    });
})();