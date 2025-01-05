import hub from "../../hub";
hub("mess/cmd");

import messStyle from "./style";
import vars from "../../var/var";
import coreFunc from "../coreFunc";
import socket from "../socket/socket";
import { messHTML } from "../../var/html";
import uiFunc from "../../ui/helpers/uiFunc";
import translateFunc from "../../utils/translate";
import permissionFunc, { PermissionFlags } from "../../utils/perm";
import {
    Core_mess__command,
    Core_mess__command_arg_list,
    Core_mess__dbMessage,
    Core_mess__sendMessage
} from "../../types/core/mess";

const barc__commads = messHTML.barc__commads;
barc__commads.style.display = "none";

export const messCmds: {
    [category: string]: {
        [key: string]: Core_mess__command
    }
} = {
    system: {
        silent: {
            args: [
                { name: "silent", type: "boolean" },
                { name: "message", type: "text" }
            ],
            exe(msg: Core_mess__dbMessage, args: any[]) {
                if (args.length == 0) return 1;
                if (args[0]) msg.silent = true;
                msg.msg = args[1];
            }
        },
        search: {
            args: [
                { name: "from", type: "user", optional: true },
                { name: "mentions", type: "text", optional: true },
                { name: "before", type: "date", optional: true },
                { name: "during", type: "date", optional: true },
                { name: "after", type: "date", optional: true },
                { name: "pinned", type: "boolean", optional: true },
                { name: "message", type: "text", optional: true }
            ],
            exe(msg: Core_mess__dbMessage, args: any[]) {
                if (args.length == 0) return 1;
                const query = {
                    from: args[0],
                    mentions: args[1],
                    before: args[2],
                    during: args[3],
                    after: args[4],
                    pinned: args[5],
                    message: args[6]
                };

                socket.emit("message.search", vars.chat.to, vars.chat.chnl, query);
                return 1;
            }
        },
        createLinkEmbed: {
            args: [
                { name: "url", type: "text" }
            ],
            exe(msg: Core_mess__dbMessage, args: any[]) {
                if (args.length == 0) return 1;
                socket.emit("send.embed.og", vars.chat.to, vars.chat.chnl, args[0]);
                return 1;
            }
        },
        createDataEmbed: {
            args: [
                { name: "title", type: "text" },
                { name: "description", type: "text", optional: true },
                { name: "url", type: "text", optional: true },
                { name: "image", type: "text", optional: true },
                { name: "custom fields", type: "map", optional: true }
            ],
            exe(msg: Core_mess__dbMessage, args: any[]) {
                if (args.length == 0) return 1;
                const embed = {
                    title: args[0],
                    description: args[1],
                    url: args[2],
                    image: args[3],
                    customFields: args[4]
                }

                socket.emit("send.embed.data", vars.chat.to, vars.chat.chnl, embed);
                return 1;
            }
        },
        clear: {
            args: [{ name: "delete", type: "number" }],
            exe(msg: Core_mess__dbMessage, args: any[]) {
                if (args.length == 0) return 1;
                let userIsMod = false;
                if (vars.chat.to.startsWith("$")) userIsMod = false;
                else if (vars.chat.to == "main") return 1;
                else {
                    const realm = vars.realm;
                    if (!realm) return 1;
                    userIsMod = permissionFunc.canAction(PermissionFlags.ManageMessages);
                }

                const msgs =
                    Array.from(document.querySelectorAll(".mess_message"))
                        .slice(-args[0])
                        .map(container => {
                            const id = container.id.replace("mess__", "");
                            const fr = container.querySelector(".mess_meta").getAttribute("_author");
                            if (fr == vars.user._id) return id;
                            return userIsMod ? id : null;
                        })
                        .filter(id => id);

                socket.emit("messages.delete", vars.chat.to, msgs);

                return 1;
            }
        }
    }
}

// Add name
Object.keys(messCmds).forEach(category => {
    Object.keys(messCmds[category]).forEach(key => {
        messCmds[category][key].name = key;
    })
});

export let currentCmd: Core_mess__command | null = null;
export function setCurrentCmd(cmd: Core_mess__command | null) {
    currentCmd = cmd;
}

const messCmd = {
    temp: [],

    check() {
        let msg = messHTML.input.value;
        if (currentCmd) {
            if (!msg.trim() || msg == "/") messCmd.close();
            return;
        }

        if (!msg.startsWith("/") && msg != "/") {
            barc__commads.style.display = "none";
            return;
        }

        if (msg.split("\n").length > 1) return messCmd.close();

        barc__commads.style.display = "";
        barc__commads.innerHTML = "";

        const cmdName = msg.trim().split(" ")[0].substring(1);
        const avelibleCmds = {};
        Object.keys(messCmds).forEach(category => {
            Object.keys(messCmds[category]).forEach(key => {
                if (key.startsWith(cmdName) || cmdName == "") {
                    if (!avelibleCmds[category]) avelibleCmds[category] = {};
                    avelibleCmds[category][key] = messCmds[category][key];
                }
            });
        });

        const allCmds: Core_mess__command[] = [];
        const allCmdsNames: { c: string, name: string }[] = [];
        Object.keys(avelibleCmds).forEach(category => {
            Object.keys(avelibleCmds[category]).forEach(key => {
                allCmds.push(avelibleCmds[category][key]);
                allCmdsNames.push({ c: category, name: key });
            });
        });

        if (allCmds.length == 0) {
            barc__commads.innerHTML = "<h2>No commands</h2>";
            currentCmd = null;
            return;
        }

        if (allCmds.length == 1) {
            currentCmd = allCmds[0];
            const { name } = allCmdsNames[0];
            const args = msg.split(" ");
            args[0] = "/" + name;
            messHTML.input.value = args.join(" ") + " ";

            messCmd.handleCommandInput();

            setTimeout(() => {
                messStyle.setSelectionStart();
            }, 100)

            coreFunc.focusInp();
            return;
        }

        currentCmd = null;
        Object.keys(avelibleCmds).forEach(category => {
            const categoryDiv = document.createElement("div");
            categoryDiv.innerHTML = `<h2>${category}</h2>`;

            const ul = document.createElement("ul");
            categoryDiv.appendChild(ul);

            Object.keys(avelibleCmds[category]).forEach(key => {
                const cmdLi = document.createElement("li");
                cmdLi.innerHTML = key;
                cmdLi.style.cursor = "pointer";
                cmdLi.tabIndex = 0;
                cmdLi.addEventListener("click", selectCmd);
                cmdLi.addEventListener("keydown", (e) => {
                    if (e.key == "Enter") selectCmd();
                });
                ul.appendChild(cmdLi);

                function selectCmd() {
                    currentCmd = avelibleCmds[category][key];
                    const args = msg.split(" ");
                    args[0] = "/" + key;
                    messHTML.input.value = args.join(" ") + " ";

                    messCmd.handleCommandInput();

                    setTimeout(() => {
                        messStyle.setSelectionStart();
                    }, 100)

                    coreFunc.focusInp();
                }
            });

            function tab(e: KeyboardEvent) {
                if (e.key !== "Tab") return;

                e.preventDefault();
                ul.querySelector("li")?.focus();
                document.removeEventListener("keydown", tab);
            }

            document.addEventListener("keydown", tab);

            barc__commads.appendChild(categoryDiv);
        });
    },

    close() {
        this.selectedCmd = null;
        barc__commads.style.display = "none";
        messHTML.input.value = "";
        messCmd.temp = [];
    },

    send(data: Core_mess__sendMessage) {
        if (!this.selectedCmd) {
            this.close();
            return 0;
        }

        const isValid = this.chceckArgs();
        if (!isValid) return 2;

        this.changeArgs();
        const args = messCmd.temp;
        const exitCode = this.selectedCmd.exe(data, args) || 0;
        this.close();

        return exitCode;
    },

    chceckArgs() {
        const argsVal = messCmd.temp;
        const argsObj = this.selectedCmd.args;

        for (let i = 0; i < argsObj.length; i++) {
            const arg = argsObj[i];
            const val = argsVal[i];

            if (arg.type != "map") {
                if (!val || val.trim() == "") {
                    if (arg.optional) continue;
                    return false;
                }
            } else {
                if (Object.keys(val).length == 0) {
                    if (arg.optional) continue;
                    return false;
                }
            }

            if (arg.type == "boolean" && val != "true" && val != "false") return false;
            else if (arg.type == "number" && isNaN(val)) return false;
            else if (arg.type == "text" && val.trim() == "") return false;
            else if (arg.type == "user" && val.trim() == "") return false;
            else if ((arg.type == "date" || arg.type == "date-time") && isNaN(Date.parse(val))) return false;
            else if (arg.type == "time") {
                const [h, m] = val.split(":");
                if (isNaN(h) || isNaN(m)) return false;
            }
            else if (arg.type == "list" && !arg.list.includes(val)) return false;
            else if (arg.type == "map" && Object.keys(val).length == 0) return false;
        }
        return true;
    },

    changeArgs() {
        const argsVal = messCmd.temp;
        const argsObj = this.selectedCmd.args;

        for (let i = 0; i < argsObj.length; i++) {
            const arg = argsObj[i];
            const val = argsVal[i];

            if (!val || (arg.type != "map" && val.trim() == "")) {
                if (arg.optional) continue;
                return false;
            }

            if (arg.type == "boolean") argsVal[i] = val == "true";
            else if (arg.type == "number") argsVal[i] = Number(val);
            else if (arg.type == "user") {
                if (val.split("-").length == 0) continue;
                const idToName = vars.apisTemp.user;
                const usersMap = new Map();
                Object.keys(idToName).forEach(id => {
                    usersMap.set(idToName[id], id);
                });
                if (!usersMap.has(val)) {
                    uiFunc.uiMsg(translateFunc.get("User not found. Skipping this argument..."));
                    delete argsVal[i];
                    continue;
                }
                argsVal[i] = usersMap.get(val);
            } else if (arg.type == "map") {
                if (Object.keys(val).length == 0) {
                    argsVal[i] = {};
                    continue;
                }
                const map = {};

                Object.keys(val).forEach(valKey => {
                    const data = val[valKey];
                    if (!data.key || !data.value) return;
                    map[data.key] = data.value;
                });
                argsVal[i] = map;
            }
        }
    },

    handleCommandInput() {
        if (!currentCmd) return;

        const container = barc__commads;

        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = "<h2>" + translateFunc.get("Command Input") + " (" + currentCmd.name + ")</h2>";

        const ul = document.createElement("ul");

        const cmdArgs = currentCmd.args;
        messCmd.temp = new Array(cmdArgs.length);

        let firstTabEle = null;

        const argsList = document.createElement("ul");
        cmdArgs.forEach((arg, index) => {
            const argItem = document.createElement("li");
            argItem.innerHTML = arg.name;
            let typeDesc = "";
            let ele;
            switch (arg.type) {
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
                case "user":
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
                    const argList = arg as Core_mess__command_arg_list;
                    typeDesc = "list";
                    ele = document.createElement("select");
                    argList.list.forEach((opt) => {
                        const option = document.createElement("option");
                        option.value = opt;
                        option.text = opt;
                        ele.appendChild(option);
                    });
                    ele.value = argList.list[0];
                    messCmd.temp[index] = argList.list[0];

                    ele.addEventListener("change", () => {
                        messCmd.temp[index] = ele.value;
                    });
                    break;
                case "map":
                    typeDesc = "map";
                    ele = document.createElement("div");
                    messCmd.temp[index] = {};

                    const create = document.createElement("button");
                    create.innerHTML = "Create Map";
                    create.style.marginTop = "5px";
                    ele.appendChild(create);
                    ele.appendChild(document.createElement("br"));
                    create.addEventListener("click", () => {
                        const key = document.createElement("input");
                        const value = document.createElement("input");
                        const span = document.createElement("span");
                        ele.appendChild(key);
                        ele.appendChild(span);
                        ele.appendChild(value);
                        ele.appendChild(document.createElement("br"));

                        key.style.marginTop = "5px";
                        span.innerHTML = ": ";
                        const indexMap = Object.keys(messCmd.temp[index]).length;
                        messCmd.temp[index][indexMap] = {};

                        key.addEventListener("input", () => {
                            messCmd.temp[index][indexMap].key = key.value;
                        });
                        value.addEventListener("input", () => {
                            messCmd.temp[index][indexMap].value = value.value;
                        });
                    });
                    break;
            }
            argItem.innerHTML += ` (${typeDesc})${arg.optional ? " (optional)" : ""} &nbsp;`;
            if (ele) argItem.appendChild(ele);
            if (!firstTabEle && ele) firstTabEle = ele;
            argsList.appendChild(argItem);
        });

        ul.appendChild(argsList);

        function tab() {
            if (!firstTabEle) return;
            firstTabEle.focus();
            document.removeEventListener("keydown", tab);
        }

        document.addEventListener("keydown", tab);

        categoryDiv.appendChild(ul);
        container.innerHTML = "";
        container.appendChild(categoryDiv);
    }
};

messHTML.input.addEventListener("input", messCmd.check);
export default messCmd;