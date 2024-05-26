const uiFunc = {
    uiMessage(data, bg="", time=6000, classe=""){
        const div = document.createElement("div");
        div.innerHTML = data;
        if(!!bg) div.style.backgroundColor = bg;
        document.querySelector("#errMesses").add(div);
        const def = "-"+(div.clientHeight+30)+"px";
        div.style.top = def;
        if(!!classe) div.classList.add(classe);
    
        setTimeout(() => {
            div.style.top = "10px";
        }, 111);
    
        setTimeout(() => {
            div.style.top = def;
        }, time - 2100);
       
        setTimeout(() => {
            // div.remove();
        }, time);
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