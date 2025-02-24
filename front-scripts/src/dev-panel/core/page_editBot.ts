import templates from "../loadTemplates";
import listBot, { page_listBot } from "./page_listBot";
import vars from "../var/var";
import socket from "./ws";

export const page_editBot = document.querySelector<HTMLDivElement>("#page_editBot");
export const page_editBot__container = document.querySelector<HTMLDivElement>("#page_editBot__container");

const editBot = {
    botInfo: null,
    botData: null,

    editBot(id){
        this.botInfo = vars.bots.find(bot => bot.id == id);
        const _this = this;
        socket.emit("bot.get", id, (data) => {
            _this.botData = data;
            _this.botData.permMap = editBotCPU.inPerm(data[0].perm);
            _this.render();
        });
    },

    render(){
        const cnt = page_editBot__container; // container
        cnt.innerHTML = templates.editBot({ botInfo: this.botInfo, botData: this.botData });
    },

    save(){
        if(!this.botInfo) return;
        const cnt = page_editBot__container;
        
        const bot = {
            info: {
                name: cnt.querySelector<HTMLInputElement>("#editBot__name").value,
            },
            data: {
                perm: editBotCPU.outPerm(),
            },
        }
        if(!bot.info.name || bot.info.name.trim() == "") return uiFunc.uiMsg("Name cannot be empty");

        socket.emit("bot.edit", this.botInfo.id, bot, () => {
            listBot.getBots();
            this.exit();
        });
    },

    exit(){
        page_editBot.fadeOut(() => {
            page_listBot.fadeIn();
        });
        this.botInfo = null;
        this.botData = null;
    },

    deleteBot(){
        if(!this.botInfo) return;
        const c1 = confirm("Are you sure?");
        if(!c1) return;
        socket.emit("bot.delete", this.botInfo.id, () => {
            listBot.getBots();
        });
        this.exit();
    },

    generateToken(){
        if(!this.botInfo) return;
        const c1 = confirm("Are you sure?");
        if(!c1) return;
        socket.emit("bot.generateToken", this.botInfo.id, (token) => {
            alert(token);
        });
    }
}

const editBotCPU = {
    inPerm(in_perms){
        const defaultSettings = {};
        dataStruct.perm.forEach(key => defaultSettings[key] = false);
        
        in_perms.forEach(key => {
            defaultSettings[key] = true;
        });
        
        return defaultSettings;
    },

    outPerm(){
        const out = [];
        const checkboxs = page_editBot__container.querySelectorAll<HTMLInputElement>("#permissionsTable input[type=checkbox]");
        checkboxs.forEach(checkbox => {
            if(checkbox.checked) out.push(checkbox.getAttribute("data-perm"));
        });
        return out;
    }
}

export default editBot;