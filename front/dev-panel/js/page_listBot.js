const page_listBot = document.querySelector("#page_listBot");
const page_listBot__container = document.querySelector("#page_listBot__container");

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