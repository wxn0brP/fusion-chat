import client from "../src/index.js";

client.on("connect", () => {
    console.log("connected to socket.io server");
});

client.on("mess", (msg) => {
    console.log(msg.msg);

});

client.login("token");
await client.enableCmd("!", import.meta.dirname+"/cmd")