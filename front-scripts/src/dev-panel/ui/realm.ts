import apis from "../core/apis";
import socket from "../core/ws";
import templates from "../loadTemplates";
import Id from "../types/Id";
import vars from "../var/var";

export function render() {
    const container = document.querySelector<HTMLDivElement>("#bot_realms__container");
    const realms = vars.botData.realms;
    
    const templateData = [];
    for (const id of realms) {
        const name = apis.www.changeChat(id);

        const data = {
            id,
            name
        }
        templateData.push(data);
    }

    container.innerHTML = templates.botRealms({ realms: templateData });
}

export async function render_botRealms(id: Id) {
    socket.emit("bot.get.realms", id, (data: Id[]) => {
        vars.botData.realms = data;
        render();
    });
}