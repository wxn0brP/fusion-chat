import { EventEmitter } from "events";
import socket from "./socket.js";
import Mess from "./mess.js";
import cmdEngine from "./cmd.js";

const eventEmitter = new EventEmitter();

const client = {
    socket,
    botInfo: {
        _id: null,
        name: null,
    },
    on: eventEmitter.on,
    emitEvent: eventEmitter.emit,
    cmd: new cmdEngine(),

    login(token){
        this.socket.auth.token = token;
        this.socket.connect();
        const _this = this;
        this.socket.emit("get.bot.info", data => _this.botInfo = data);
    },
    async enableCmd(prefix, dirPath, opts={}){
        opts = {
            webhook: false,
            bot: false,
            ...opts
        }
        this.cmd.setPrefix(prefix);
        await this.cmd.loadCommands(dirPath);
        this.cmd.enabled = true;
        this.cmd.opts = opts;
    }
}

client.socket.on("connect", () => client.emitEvent("connect"));
client.socket.on("disconnect", () => client.emitEvent("disconnect"));
client.socket.on("connect_error", (...data) => client.emitEvent("connect_error", ...data));
client.socket.on("error", (...data) => client.emitEvent("error", ...data));
client.socket.on("mess", async (req) => {
    if(req.fr === client.botInfo._id) return;
    const mess = new Mess(client, req);

    const cmd = await client.cmd.handleInput(mess);
    if(cmd.c == 0) return;
    if(cmd.c == 2){
        mess.reply(cmd.msg);
        return;
    }

    client.emitEvent("mess", mess);
});

export default client;
export {
    Mess,
    socket,
    eventEmitter,
}