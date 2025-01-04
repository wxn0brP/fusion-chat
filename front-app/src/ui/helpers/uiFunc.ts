import hub from "../../hub";
hub("uiFunc");

import debugFunc from "../../core/debug";

export const errMessesDiv = document.querySelector<HTMLDivElement>("#errMesses");
export const promptDiv = document.querySelector<HTMLDivElement>("#prompt");

const uiFunc = {
    async uiMessage(message: string, backgroundColor: string="", displayTime: number=6000, className: string=""){
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
                top += (child as HTMLDivElement).offsetHeight + padding;
            return top;
        }

        let ended = false;

        async function end(){
            ended = true;
            div.style.top = `-${div.offsetHeight + 20}px`;
    
            await delay(700);
            for(const child of errMessesDiv.children){
                const childE = child as HTMLDivElement;
                const currentTop = parseInt(childE.style.top.replace("px", ""));
                childE.style.top = `${currentTop - padding - div.offsetHeight}px`;
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
    
    uiMsg(data: string, extraTime: number=0){
        if(debugFunc.isDebug) lo("uiMsg:", data);

        const speed = 1/3; //1s = 3 words
        const time = data.split(" ").length * speed + 6 + extraTime;
        uiFunc.uiMessage(data, undefined, time * 1000, "uiMsgClass");
    },

    prompt(text, defaultValue=""): Promise<string> {
        return new Promise((resolve) => {
            function end(){
                resolve(input.value);
                div.fadeOut();
                setTimeout(() => {
                    div.remove();
                }, 2000);
            }

            const div = document.createElement("div");
            div.style.opacity = "0";
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

    selectPrompt<T>(text, options, optionsValues=[]): Promise<string | T> {
        return new Promise((resolve) => {
            function end(){
                resolve(select.value);
                div.fadeOut();
                setTimeout(() => {
                    div.remove();
                }, 2000);
            }
            
            const div = document.createElement("div");
            div.style.opacity = "0";
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
}

export default uiFunc;