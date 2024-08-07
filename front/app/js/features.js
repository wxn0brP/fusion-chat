document.querySelector("#nav__toggle").addEventListener("click", () => {
    const nav = document.querySelector("nav").style;
    nav.left = nav.left == "0px" ? "-360px" : "0px";
});

document.querySelector("#navs__user img").src = "/profileImg?id=" + vars.user._id;

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

(function initEmocji(){
    const emoticonMenu = document.querySelector("#emocjiDiv_container");

    const emotkiUnicode = [
        [128512, 128591],
        // [127744, 127884],
        // [128640, 128704],
        // [127462, 127487],
        // [9728, 9983],
        // [9984, 10175]
    ];

    function emit(emoticon){
        const event = new CustomEvent('emocji', {
            detail: emoticon,
        });
        emocjiDiv.dispatchEvent(event);
    }

    emotkiUnicode.forEach(range => {
        for(let i = range[0]; i <= range[1]; i++){
            const emoticon = String.fromCodePoint(i);
            const div = document.createElement('div');
            div.textContent = emoticon;
            div.className = 'emocji';
            div.onclick = () => emit(emoticon);
            emoticonMenu.appendChild(div);
        }
    });
})();

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