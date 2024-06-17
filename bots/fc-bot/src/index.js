const EventEmitter = new (require("events"))();
const socket = require("./socket");
const Mess = require("./mess");
const cmdEngine = require("./cmd");

const client = {
    socket,
    on: EventEmitter.on,
    emitEvent: EventEmitter.emit,
    cmd: new cmdEngine(),

    login(token){
        this.socket.auth.token = token;
        this.socket.connect();
    },
    enableCmd(prefix, dirPath){
        this.cmd.setPrefix(prefix);
        this.cmd.loadCommands(dirPath);
        this.cmd.enabled = true;
    }
}

client.socket.on("connect", () => client.emitEvent("connect"));
client.socket.on("disconnect", () => client.emitEvent("disconnect"));
client.socket.on("connect_error", (data) => client.emitEvent("connect_error", data));
client.socket.on("error", (data) => client.emitEvent("error", data));
client.socket.on("mess", async (req) => {
    if(req.to == "@") return;
    const mess = new Mess(client, req);

    const cmd = await client.cmd.handleInput(mess);
    if(cmd.c == 0) return;
    if(cmd.c == 2){
        mess.reply(cmd.msg);
        return;
    }

    client.emitEvent("mess", mess);
});

module.exports = client;