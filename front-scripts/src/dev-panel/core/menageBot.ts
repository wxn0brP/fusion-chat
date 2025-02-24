import templates from "../loadTemplates";
import mainListBots from "./mainList";
import vars from "../var/var";
import socket from "./ws";
import Id from "../types/Id";
import { page_menageBot, page_menageBot__container, page_listBot } from "../var/html";
import { render_botRealms } from "../ui/realm";
import uiFunc from "../utils/uiFunc";

class EditBot {
    constructor() {

    }

    editBot(id: Id) {
        vars.actualBot = vars.bots.find(bot => bot.id == id);
        page_menageBot__container.innerHTML = templates.menageBot({ botInfo: vars.actualBot, botData: vars.botData });
        render_botRealms(id);
    }

    save() {
        if (!vars.actualBot) return;
        const cnt = page_menageBot__container;

        const info = {
            name: cnt.querySelector<HTMLInputElement>("#editBot__name").value,
        }
        if (!info.name || info.name.trim() == "") return uiFunc.uiMsg("Name cannot be empty");

        socket.emit("bot.edit", vars.actualBot.id, info, () => {
            mainListBots.getBots();
            this.exit();
        });
    }

    exit() {
        page_menageBot.fadeOut(() => {
            page_listBot.fadeIn();
        });
        vars.actualBot = null;
    }

    deleteBot() {
        if (!vars.actualBot) return;
        const conf = confirm("Are you sure?");
        if (!conf) return;
        socket.emit("bot.delete", vars.actualBot.id, () => {
            mainListBots.getBots();
        });
        this.exit();
    }

    generateToken() {
        if (!vars.actualBot) return;
        const conf = confirm("Are you sure?");
        if (!conf) return;
        socket.emit("bot.generate.token", vars.actualBot.id, (token: string) => {
            alert(token);
        });
    }

    exitFromRealm(id: Id) {
        if (!vars.actualBot) return;
        const conf = confirm("Are you sure?");
        if (!conf) return;
        socket.emit("bot.realm.exit", vars.actualBot.id, id, () => {
            render_botRealms(vars.actualBot.id);
        });
    }
}

const menageBot = new EditBot();
export default menageBot;
(window as any).menageBot = menageBot;