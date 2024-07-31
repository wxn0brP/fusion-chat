const fs = require("fs");

module.exports = (socket) => {
    socket.on("disconnect", () => {
        const sockets = global.getSocket(socket.user._id);
        if(sockets.length == 0){
            fs.rm(`userFiles/${socket.user._id}`, { recursive: true, force: true }, (err) => {
                if(err) console.log(err);
            });
        }
    });
}