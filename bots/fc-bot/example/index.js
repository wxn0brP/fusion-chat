const client = require("../src");

client.on("connect", () => {
    console.log("connected to socket.io server");
});

client.on("mess", (msg) => {
    console.log(msg.msg);
});

client.login("token");
client.enableCmd("!", __dirname+"/cmd");