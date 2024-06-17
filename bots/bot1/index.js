require("dotenv").config();
const client = require("fc-bot");

client.on("connect", () => {
    console.log("connected to socket.io server");
});

client.on("mess", (msg) => {
    if(msg.msg == "ping") msg.reply("pong");
});

client.login(process.env.token);