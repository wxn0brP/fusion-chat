import templates from "../loadTemplates";
import menageBot from "./menageBot";
import vars from "../var/var";
import socket from "./ws";
import { API_botMeta } from "../types/api";
import Id from "../types/Id";
import { page_menageBot, page_listBot, page_listBot__container } from "../var/html";
import uiFunc from "../utils/uiFunc";

class MainListBots {
    constructor() {
        
    }

    renderBots(){
        const bots = vars.bots;
        page_listBot__container.innerHTML = templates.listBot({ bots });
    }

    getBots(){
        socket.emit("bots.get", (bots: API_botMeta[]) => {
            vars.bots = bots;
            this.renderBots();
        });
    }

    editBot(id: Id){
        page_listBot.fadeOut(() => {
            page_menageBot.fadeIn();
        });
        menageBot.editBot(id);
    }

    async addBot(){
        const name = await uiFunc.prompt("Name of the bot");
        if(!name) return;
        socket.emit("bot.create", name, () => {
            mainListBots.getBots();
        });
    }
}

const mainListBots = new MainListBots();
export default mainListBots;
(window as any).listBot = mainListBots;