const barc__commads = document.querySelector("#barc__commads");
barc__commads.style.display = "none";

messInput.addEventListener("input", () => messCmd.check(messInput.value));

const messCmds = {
    system: {
        silent: {
            args: [
                {
                    name: "silent",
                    type: "boolean"
                },
                {
                    name: "message",
                    type: "text"
                }
            ],
            exe(msg, args){
                if(args.length == 0) return;

                if(args[0] == "true"){
                    msg.silent = true;
                }

                args.splice(0, 1);
                msg.msg = args.join(" ");
                lo(msg)
            }
        }
    }
}

const messCmd = {
    selectedCmd: null,
    handleInput: null,

    check(msg){
        if(this.selectedCmd) return;

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

        if(allCmds.length == 1 && this.selectedCmd){
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
                    this.selectedCmd = avelibleCmds[category][key];
                    const args = msg.split(" ");
                    args[0] = "/" + key;
                    messInput.value = args.join(" ") + " ";

                    messCmdArgs.handleCommandInput(
                        barc__commads,
                        key,
                        this.selectedCmd
                    );

                    coreFunc.focusInp();
                });
                ul.appendChild(cmdLi);
            });

            barc__commads.appendChild(categoryDiv);
        });
    },

    send(data){
        if(!this.selectedCmd) return;
        lo(this.selectedCmd)

        const args = data.msg.split(" ");
        args.splice(0, 1);

        this.selectedCmd.exe(data, args);

        this.selectedCmd = null;
        barc__commads.style.display = "none";
        if(this.handleInput){
            messInput.removeEventListener("input", this.handleInput);
            this.handleInput = null;
        }
    }
}

const messCmdArgs = {
    validateArgs(input, argDefs){
        const inputs = input.split(' ').slice(1);
        const validationResults = [];

        if(inputs.length < argDefs.length){
            return argDefs.map((_, index) => 
                inputs[index] === undefined || inputs[index].trim() === "" ? 0 : 2
            );
        }

        argDefs.forEach((arg, index) => {
            const value = inputs[index];
            if(value === undefined || value.trim() === ""){
                validationResults.push(0);
            }else if(arg.type === "boolean"){
                validationResults.push(value === "true" || value === "false" ? 1 : 2);
            }else if(arg.type === "number"){
                validationResults.push(!isNaN(value) ? 1 : 2);
            }else if(arg.type === "text"){
                validationResults.push(value.trim() !== "" ? 1 : 2);
            }else{
                validationResults.push(2);
            }
        });

        return validationResults;
    },

    updateArgColors(argsList, validationResults){
        const argsArray = Array.from(argsList.children);
        argsArray.forEach((li, index) => {
            const result = validationResults[index];
            if(result === 0){
                li.style.color = "red";
            }else if(result === 1){
                li.style.color = "green";
            }else if(result === 2) {
                li.style.color = "yellow";
            }
        });
    },

    handleCommandInput(container, cmdName, commandObj){
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = "<h2>" + translateFunc.get("Command Input") + "</h2>";

        const ul = document.createElement("ul");
        categoryDiv.appendChild(ul);

        const cmdArgs = commandObj.args;

        const argsList = document.createElement("ul");
        cmdArgs.forEach(arg => {
            const argItem = document.createElement("li");
            argItem.innerHTML = arg.name;
            let typeDesc = "";
            switch(arg.type){
                case "boolean":
                    typeDesc = "true/false";
                break;
                case "number":
                    typeDesc = "number";
                break;
                case "text":
                    typeDesc = "text";
                break;
            }
            argItem.innerHTML += ` (${typeDesc})`;
            argItem.style.color = "red";
            argsList.appendChild(argItem);
        });

        ul.appendChild(argsList);

        function handleInput(){
            const inputValue = messInput.value;

            if(inputValue.length == 0 || !inputValue.startsWith("/"+cmdName)){
                barc__commads.style.display = "none";
                messCmd.selectedCmd = null;
                messCmd.handleInput = null;
                messInput.removeEventListener("input", handleInput);
                return;
            }

            const validationResults = messCmdArgs.validateArgs(inputValue, cmdArgs);
            messCmdArgs.updateArgColors(argsList, validationResults);

            const allValid = validationResults.every(result => result === 1);

            if(allValid && inputValue.endsWith(" ")){
                messCmd.selectedCmd.ok = true;
                barc__commads.style.display = "none";
            }

            if(messCmd.selectedCmd.ok && !allValid){
                barc__commads.style.display = "";
                messCmd.selectedCmd.ok = false;
            }
        }

        messCmd.selectedCmd.ok = false;
        messInput.addEventListener("input", handleInput);
        handleInput();
        messCmd.handleInput = handleInput;

        container.innerHTML = "";
        container.appendChild(categoryDiv);
    }
};