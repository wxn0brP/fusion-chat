const barc__commads = document.querySelector("#barc__commads");
barc__commads.style.display = "none";

const messCmds = {
    system: {
        silent: {
            args: [
                { name: "silent", type: "boolean" },
                { name: "message", type: "text" }
            ],
            exe(msg, args){
                if(args.length == 0) return 1;
                if(args[0]) msg.silent = true;
                msg.msg = args[1];
            }
        },
        search: {
            args: [
                { name: "from", type: "text", optional: true },
                { name: "mentions", type: "text", optional: true },
                { name: "before", type: "date", optional: true },
                { name: "during", type: "date", optional: true },
                { name: "after", type: "date", optional: true },
                { name: "pinned", type: "boolean", optional: true },
                { name: "message", type: "text", optional: true }
            ],
            exe(msg, args){
                if(args.length == 0) return 1;
                const query = {};
                query.from = args[0];
                query.mentions = args[1];
                query.before = args[2];
                query.during = args[3];
                query.after = args[4];
                query.pinned = args[5];
                query.message = args[6];

                socket.emit("message.search", vars.chat.to, vars.chat.chnl, query);
                return 1;
            }
        }
    }
}

const messCmd = {
    selectedCmd: null,
    temp: [],

    check(){
        if(this.selectedCmd) return;
        let msg = messInput.value;

        if(!msg.startsWith("/") && msg != "/"){
            barc__commads.style.display = "none";
            return;
        }

        barc__commads.style.display = "";
        barc__commads.innerHTML = "";

        const cmdName = msg.split(" ")[0].substring(1);
        const avelibleCmds = {};
        Object.keys(messCmds).forEach(category => {
            Object.keys(messCmds[category]).forEach(key => {
                if(key.startsWith(cmdName) || cmdName == ""){
                    if(!avelibleCmds[category]) avelibleCmds[category] = {};
                    avelibleCmds[category][key] = messCmds[category][key];
                }
            });
        });

        const allCmds = [];
        Object.keys(avelibleCmds).forEach(category => {
            Object.keys(avelibleCmds[category]).forEach(key => {
                allCmds.push(avelibleCmds[category][key]);
            });
        });

        if(allCmds.length == 0){
            barc__commads.innerHTML = "<h2>No commands</h2>";
            this.selectedCmd = null;
            return;
        }

        this.selectedCmd = null;
        Object.keys(avelibleCmds).forEach(category => {
            const categoryDiv = document.createElement("div");
            categoryDiv.innerHTML = `<h2>${category}</h2>`;

            const ul = document.createElement("ul");
            categoryDiv.appendChild(ul);

            Object.keys(avelibleCmds[category]).forEach(key => {
                const cmdLi = document.createElement("li");
                cmdLi.innerHTML = key;
                cmdLi.style.cursor = "pointer";
                cmdLi.addEventListener("click", () => {
                    messCmd.selectedCmd = avelibleCmds[category][key];
                    const args = msg.split(" ");
                    args[0] = "/" + key;
                    messInput.value = args.join(" ") + " ";

                    messCmd.handleCommandInput(
                        barc__commads,
                        key,
                        messCmd.selectedCmd
                    );

                    coreFunc.focusInp();
                });
                ul.appendChild(cmdLi);
            });

            barc__commads.appendChild(categoryDiv);
        });
    },

    close(){
        this.selectedCmd = null;
        barc__commads.style.display = "none";
        messInput.value = "";
        messCmd.temp = [];
    },

    send(data){
        if(!this.selectedCmd){
            this.close();
            return 0;
        }
        
        const isValid = this.chceckArgs();
        if(!isValid) return 2;

        this.changeArgs();
        const args = messCmd.temp;
        const exitCode = this.selectedCmd.exe(data, args) || 0;
        this.close();
        
        return exitCode;
    },

    chceckArgs(){
        const argsVal = messCmd.temp;
        const argsObj = this.selectedCmd.args;

        for(let i=0; i<argsObj.length; i++){
            const arg = argsObj[i];
            const val = argsVal[i];

            if(!val || val.trim() == ""){
                if(arg.optional) continue;
                return false;
            }

            if(arg.type == "boolean" && val != "true" && val != "false") return false;
            else if(arg.type == "number" && isNaN(val)) return false;
            else if(arg.type == "text" && val.trim() == "") return false;
            else if((arg.type == "date" || arg.type == "date-time") && isNaN(Date.parse(val))) return false;
            else if(arg.type == "time"){
                const [h, m] = val.split(":");
                if(isNaN(h) || isNaN(m)) return false;
            }
            else if(arg.type == "list" && !arg.list.includes(val)) return false;
        }
        return true;
    },

    changeArgs(){
        const argsVal = messCmd.temp;
        const argsObj = this.selectedCmd.args;

        for(let i=0; i<argsObj.length; i++){
            const arg = argsObj[i];
            const val = argsVal[i];

            if(!val || val.trim() == ""){
                if(arg.optional) continue;
                return false;
            }

            if(arg.type == "boolean") argsVal[i] = val == "true";
            else if(arg.type == "number") argsVal[i] = Number(val);
        }
    },

    handleCommandInput(container, cmdName, commandObj){
        commandObj.name = cmdName;
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = "<h2>" + translateFunc.get("Command Input") + " (" + cmdName + ")</h2>";

        const ul = document.createElement("ul");

        const cmdArgs = commandObj.args;
        messCmd.temp = new Array(cmdArgs.length);

        const argsList = document.createElement("ul");
        cmdArgs.forEach((arg, index) => {
            const argItem = document.createElement("li");
            argItem.innerHTML = arg.name;
            let typeDesc = "";
            let ele;
            switch(arg.type){
                case "boolean":
                    typeDesc = "true/false";
                    ele = document.createElement("select");
                    ["false", "true"].forEach((opt) => {
                        const option = document.createElement("option");
                        option.value = opt;
                        option.text = opt;
                        ele.appendChild(option);
                    });
                    ele.value = "false";
                    messCmd.temp[index] = "false";

                    ele.addEventListener("change", () => {
                        messCmd.temp[index] = ele.value === "true" ? "true" : "false";
                    });
                break;
                case "number":
                    typeDesc = "number";
                    ele = document.createElement("input");
                    ele.type = "number";
                    ele.addEventListener("input", () => {
                        messCmd.temp[index] = ele.value;
                    });
                break;
                case "text":
                    typeDesc = "text";
                    ele = document.createElement("input");
                    ele.type = "text";
                    ele.addEventListener("input", () => {
                        messCmd.temp[index] = ele.value;
                    });
                break;
                case "date":
                    typeDesc = "date";
                    ele = document.createElement("input");
                    ele.type = "date";
                    ele.addEventListener("input", () => {
                        messCmd.temp[index] = ele.value;
                    });
                break;
                case "time":
                    typeDesc = "time";
                    ele = document.createElement("input");
                    ele.type = "time";
                    ele.addEventListener("input", () => {
                        messCmd.temp[index] = ele.value;
                    });
                break;
                case "date-time":
                    typeDesc = "date-time";
                    ele = document.createElement("input");
                    ele.type = "datetime-local";
                    ele.addEventListener("input", () => {
                        messCmd.temp[index] = ele.value;
                    });
                break;
                case "list":
                    typeDesc = "list";
                    ele = document.createElement("select");
                    arg.list.forEach((opt) => {
                        const option = document.createElement("option");
                        option.value = opt;
                        option.text = opt;
                        ele.appendChild(option);
                    });
                    ele.value = arg.list[0];
                    messCmd.temp[index] = arg.list[0];

                    ele.addEventListener("change", () => {
                        messCmd.temp[index] = ele.value;
                    });
                break;
            }
            argItem.innerHTML += ` (${typeDesc}) &nbsp;`;
            if(ele) argItem.appendChild(ele);
            argsList.appendChild(argItem);
        });

        ul.appendChild(argsList);

        categoryDiv.appendChild(ul);
        container.innerHTML = "";
        container.appendChild(categoryDiv);
    }
};

messInput.addEventListener("input", messCmd.check);