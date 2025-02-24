import hub from "../../hub.js";
hub("helpers/uiFunc");
import debugFunc, { LogLevel } from "../../core/debug.js";
import LangPkg, { langFunc } from "../../utils/translate.js";
export const errMessesDiv = document.querySelector("#errMesses");
export const promptDiv = document.querySelector("#prompt");
const uiFunc = {
    async uiMessage(message, opts = {}) {
        opts = {
            displayTime: 6000,
            ...opts,
        };
        const div = document.createElement("div");
        div.innerHTML = message;
        div.style.top = `-${div.offsetHeight + 20}px`;
        if (opts.className)
            div.classList.add(opts.className);
        if (opts.backgroundColor)
            div.style.backgroundColor = opts.backgroundColor;
        const padding = 10;
        let topPosition = calculateTopPosition();
        function calculateTopPosition() {
            let top = 0;
            for (const child of errMessesDiv.children)
                top += child.offsetHeight + padding;
            return top;
        }
        let ended = false;
        async function end() {
            ended = true;
            div.style.top = `-${div.offsetHeight + 20}px`;
            await delay(700);
            for (const child of errMessesDiv.children) {
                const childE = child;
                const currentTop = parseInt(childE.style.top.replace("px", ""));
                childE.style.top = `${currentTop - padding - div.offsetHeight}px`;
            }
            div.remove();
        }
        div.addEventListener("click", end);
        if (opts.onClick)
            div.addEventListener("click", opts.onClick);
        errMessesDiv.appendChild(div);
        await delay(100);
        div.style.top = `${10 + topPosition}px`;
        await delay(opts.displayTime - 700);
        if (ended)
            return;
        await end();
    },
    uiMsg(data, opts = {}) {
        debugFunc.msg(LogLevel.INFO, "uiMsg:", data);
        opts = {
            extraTime: 0,
            ...opts
        };
        const speed = 1 / 3;
        const time = data.split(" ").length * speed + 6 + opts.extraTime;
        const msgOpts = {
            displayTime: time * 1000,
            className: "uiMsgClass",
        };
        if (opts.onClick)
            msgOpts.onClick = opts.onClick;
        uiFunc.uiMessage(data, msgOpts);
    },
    uiMsgT(text, ...data) {
        let lastText = "";
        if (data.length > 0) {
            if (Array.isArray(data[0])) {
                lastText = data.shift();
            }
        }
        text = langFunc(text, ...data) + lastText;
        uiFunc.uiMsg(text);
    },
    prompt(text, defaultValue = "") {
        return new Promise((resolve) => {
            function end() {
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
                if (e.key == "Enter")
                    end();
            });
            div.appendChild(input);
            setTimeout(() => {
                input.focus();
            }, 100);
            div.appendChild(document.createElement("br"));
            const btn = document.createElement("button");
            btn.innerHTML = "OK";
            div.appendChild(btn);
            btn.addEventListener("click", end);
            promptDiv.appendChild(div);
            div.fadeIn();
        });
    },
    confirm(text, yesText = LangPkg.uni.ok, noText = LangPkg.uni.cancel) {
        return new Promise((resolve) => {
            function end(accept) {
                return () => {
                    resolve(accept);
                    div.fadeOut();
                    setTimeout(() => {
                        div.remove();
                    }, 2000);
                };
            }
            const div = document.createElement("div");
            div.style.opacity = "0";
            div.classList.add("prompt");
            div.innerHTML = "<p>" + text + "<p><br />";
            const flex = document.createElement("div");
            flex.style.display = "flex";
            flex.style.justifyContent = "space-evenly";
            const reject = document.createElement("button");
            reject.innerHTML = noText || LangPkg.uni.cancel;
            reject.addEventListener("click", end(false));
            flex.appendChild(reject);
            const accept = document.createElement("button");
            accept.innerHTML = yesText || LangPkg.uni.ok;
            accept.addEventListener("click", end(true));
            flex.appendChild(accept);
            div.appendChild(flex);
            promptDiv.appendChild(div);
            div.fadeIn();
        });
    },
    selectPrompt(text, options, optionsValues = [], categories = []) {
        return new Promise((resolve) => {
            function end() {
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
            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];
                const selectElement = document.createElement("optgroup");
                selectElement.label = category.name;
                for (let j = 0; j < category.options.length; j++) {
                    const optionElement = document.createElement("option");
                    optionElement.value = category.options[j] || category.options[j];
                    optionElement.innerHTML = category.options[j];
                    selectElement.appendChild(optionElement);
                }
                select.appendChild(selectElement);
            }
            for (let i = 0; i < options.length; i++) {
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
    promptTime(text, inputType = "datetime-local", min, max) {
        return new Promise((resolve) => {
            function end() {
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
            input.type = inputType;
            input.value = "00:00";
            if (min)
                input.min = new Date(min).toISOString();
            if (max)
                input.max = new Date(max).toISOString();
            input.addEventListener("keydown", (e) => {
                if (e.key == "Enter")
                    end();
            });
            div.appendChild(input);
            setTimeout(() => {
                input.focus();
            }, 100);
            div.appendChild(document.createElement("br"));
            const btn = document.createElement("button");
            btn.innerHTML = "OK";
            div.appendChild(btn);
            btn.addEventListener("click", end);
            promptDiv.appendChild(div);
            div.fadeIn();
        });
    }
};
export default uiFunc;
//# sourceMappingURL=uiFunc.js.map