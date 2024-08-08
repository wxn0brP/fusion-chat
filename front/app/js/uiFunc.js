const errMessesDiv = document.querySelector("#errMesses");

const uiFunc = {
    async uiMessage(message, backgroundColor="", displayTime=6000, className=""){
        const div = document.createElement("div");
        div.textContent = message;
        if(backgroundColor) div.style.backgroundColor = backgroundColor;

        const defaultPosition = `-${div.offsetHeight + 50}px`;
        div.style.top = defaultPosition;
        if(className) div.classList.add(className);

        const padding = 10;
        let topPosition = calculateTopPosition();

        function calculateTopPosition(){
            let top = 0;
            for(const child of errMessesDiv.children)
                top += child.offsetHeight + padding;
            return top;
        }

        errMessesDiv.appendChild(div);
        await delay(100);
        div.style.top = `${10 + topPosition}px`;

        await delay(displayTime - 700);
        div.style.top = defaultPosition;

        await delay(700);
        for(const child of errMessesDiv.children){
            const currentTop = parseInt(child.style.top.replace("px", ""));
            child.style.top = `${currentTop - padding - div.offsetHeight}px`;
        }
        div.remove();
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

            document.querySelector("#prompt").appendChild(div);
            div.fadeIn();
        })
    },

    selectPrompt(text, options){
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
            options.forEach(option => {
                const optionElement = document.createElement("option");
                optionElement.value = option;
                optionElement.innerHTML = option;
                select.appendChild(optionElement);
            });
            select.querySelector("option").selected = true;
            
            div.appendChild(select);
            div.appendChild(document.createElement("br"));

            const btn = document.createElement("button");
            btn.innerHTML = "OK";
            div.appendChild(btn);
            btn.addEventListener("click", end);

            document.querySelector("#prompt").appendChild(div);
            div.fadeIn();
        });
    }
}