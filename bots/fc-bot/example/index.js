import client from "../src/index.js";

client.on("connect", () => {
    console.log("connected to socket.io server");
});

client.on("connect_error", (err) => {
    console.error(err);
});

client.on("mess", (msg) => {
    console.log("mess: ", msg.msg);

});

client.login("token");
await client.enableCmd("!", import.meta.dirname+"/cmd");