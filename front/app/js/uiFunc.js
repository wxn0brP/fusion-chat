const errMessesDiv = document.querySelector("#errMesses");
const promptDiv = document.querySelector("#prompt");

const uiFunc = {
    async uiMessage(message, backgroundColor="", displayTime=6000, className=""){
        const div = document.createElement("div");
        div.textContent = message;
        if(backgroundColor) div.style.backgroundColor = backgroundColor;

        div.style.top = `-${div.offsetHeight + 20}px`;
        if(className) div.classList.add(className);

        const padding = 10;
        let topPosition = calculateTopPosition();

        function calculateTopPosition(){
            let top = 0;
            for(const child of errMessesDiv.children)
                top += child.offsetHeight + padding;
            return top;
        }

        let ended = false;

        async function end(){
            ended = true;
            div.style.top = `-${div.offsetHeight + 20}px`;
    
            await delay(700);
            for(const child of errMessesDiv.children){
                const currentTop = parseInt(child.style.top.replace("px", ""));
                child.style.top = `${currentTop - padding - div.offsetHeight}px`;
            }
            div.remove();
        }

        div.addEventListener("click", end);

        errMessesDiv.appendChild(div);
        await delay(100);
        div.style.top = `${10 + topPosition}px`;

        await delay(displayTime - 700);
        if(ended) return;
        await end();
    },
    
    uiMsg(data, extraTime=0){
        if(debugFunc.isDebug) lo("uiMsg:", data);

        const speed = 1/3; //1s = 3 words
        const time = data.split(" ").length * speed + 6 + extraTime;
        uiFunc.uiMessage(data, undefined, time * 1000, "uiMsgClass");
    },

    editMess(id){
        const messageDiv = document.querySelector("#mess__"+id+" .mess_content");
        if(!messageDiv) return;
        const message = messageDiv.getAttribute("_plain");
        const input = document.querySelector("#mess-input");
        input.value = message;
        vars.temp.editId = id;
        
        editCloseDiv.style.display = "block";
        coreFunc.focusInp(true);
    },

    prompt(text, defaultValue=""){
        return new Promise((resolve) => {
            function end(){
                resolve(input.value);
                div.fadeOut();
                setTimeout(() => {
                    div.remove();
                }, 2000);
            }

            const div = document.createElement("div");
            div.style.opacity = 0;
            div.classList.add("prompt");
            div.innerHTML = "<p>" + text + "<p><br />";

            const input = document.createElement("input");
            input.type = "text";
            input.value = defaultValue;
            input.addEventListener("keydown", (e) => {
                if(e.key == "Enter") end();
            })
            div.appendChild(input);

            div.appendChild(document.createElement("br"));

            const btn = document.createElement("button");
            btn.innerHTML = "OK";
            div.appendChild(btn);
            btn.addEventListener("click", end);

            promptDiv.appendChild(div);
            div.fadeIn();
        });
    },

    selectPrompt(text, options, optionsValues=[]){
        return new Promise((resolve) => {
            function end(){
                resolve(select.value);
                div.fadeOut();
                setTimeout(() => {
                    div.remove();
                }, 2000);
            }
            
            const div = document.createElement("div");
            div.style.opacity = 0;
            div.classList.add("prompt");
            div.innerHTML = "<p>" + text + "<p><br />";
            const select = document.createElement("select");
            for(let i=0; i<options.length; i++){
                const optionElement = document.createElement("option");
                optionElement.value = optionsValues[i] || options[i];
                optionElement.innerHTML = options[i];
                select.appendChild(optionElement);
            }
            select.querySelector("option").selected = true;
            
            div.appendChild(select);
            div.appendChild(document.createElement("br"));

            const btn = document.createElement("button");
            btn.innerHTML = "OK";
            div.appendChild(btn);
            btn.addEventListener("click", end);

            promptDiv.appendChild(div);
            div.fadeIn();
        });
    },

    clipboardError(text){
        const div = document.createElement("div");
        div.style.opacity = 0;
        div.classList.add("prompt");
        div.innerHTML = "<h2>" + translateFunc.get("Copy to Clipboard error.") + "</h2>";
        div.innerHTML += "<h3>" + translateFunc.get("Please copy manually.") + "</h3>";

        div.appendChild(document.createElement("br"));

        const textarea = document.createElement("textarea");
        textarea.value = text;
        div.appendChild(textarea);

        div.appendChild(document.createElement("br"));

        const btn = document.createElement("button");
        btn.innerHTML = "OK";
        div.appendChild(btn);
        btn.addEventListener("click", () => {
            div.fadeOut();
            setTimeout(() => {
                div.remove();
            }, 2000);
        });

        promptDiv.appendChild(div);
        div.fadeIn(() => {
            textarea.select();
        });
    }
}