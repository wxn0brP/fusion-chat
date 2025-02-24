import templates from "../loadTemplates";
import editBot, { page_editBot } from "./page_editBot";
import vars from "../var/var";
import socket from "./ws";

export const page_listBot = document.querySelector<HTMLDivElement>("#page_listBot");
export const page_listBot__container = document.querySelector<HTMLDivElement>("#page_listBot__container");

const listBot = {
    renderBots(){
        const bots = vars.bots;
        page_listBot__container.innerHTML = templates.listBot({ bots });
    },

    getBots(){
        socket.emit("bots.get", (bots) => {
            vars.bots = bots;
            this.renderBots();
        });
    },

    editBot(id){
        page_listBot.fadeOut(() => {
            page_editBot.fadeIn();
        });
        editBot.editBot(id);
    },

    async addBot(){
        const name = await uiFunc.prompt("Name of the bot");
        if(!name) return;
        socket.emit("bot.create", name, () => {
            listBot.getBots();
        });
    }
}

export default listBot;