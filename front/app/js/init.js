if(!localStorage.getItem("token")) window.location = "/login";

(() => {
    const htmlParser = new DOMParser();

    function loadComponent(path, parentEle){
        const text = cw.get(path);
        const html = htmlParser.parseFromString(text, "text/html");
        const elements = Array.from(html.body.children);
        for(let e of elements){
            parentEle.insertAdjacentElement("afterend", e);
            loadComponents(e);
        }
    }

    function loadComponents(ele){
        ele.querySelectorAll("[loadPart]").forEach(loadPart => {
            loadComponent("html/"+loadPart.getAttribute("loadPart")+".html", loadPart);
            loadPart.remove();
        });
    }

    async function loadJs(){
        const srcs = [
            "/libs/peerjs.min.js",
            "var",
            "utils",
            "debug",
            "ws",
            "apis",
            "coreFunc",
            "uiFunc",
            
            "contextMenuLib",
            "settingsLib",
            "settingsServerLib",
            "swipeLib",

            "translate",
            "format",
            "mess",
            "contextMenu",
            "buttons",
            "settings",
            "renders",
            "voice",
            
            "warning",
            "start",
            "features"
        ];

        let assets = document.querySelector("#assets");
        function loadScript(p){
            return new Promise((resolve) => {
                const script = document.createElement("script");
                if(!p.startsWith("js/") && !p.endsWith(".js"))
                    p = "js/" + p + ".js";
                
                script.src = p;
                const loadEvt = () => {
                    resolve();
                    script.removeEventListener("load", loadEvt);
                }
                script.addEventListener("load", loadEvt);
                assets.appendChild(script);
            })
        }

        for(let i=0; i<srcs.length; i++){
            await loadScript(srcs[i]);
        }
    }

    loadComponents(document.querySelector("#app"));
    loadJs();
    document.querySelectorAll(".delete").forEach(e => {
        let time = parseInt(e.getAttribute("time"));
        setTimeout(()=>e.remove(), time);
    });
    document.querySelectorAll("[loadInner]").forEach(e => {
        e.innerHTML = cw.get(e.getAttribute("loadInner"));
    });
})();