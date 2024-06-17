const link = process.env.socketLink || "http://fusion.ct8.pl";
const socket = require("socket.io-client")(link, {
    transports: ["websocket"],
    auth: {
        token: null
    },
    autoconnect: true
});

module.exports = socket;