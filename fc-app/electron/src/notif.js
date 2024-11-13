const { Notification } = require('electron');

function createNotif(title, body, callback=()=>{}){
    const notif = new Notification({
        title,
        body,
        icon: "favicon.png"
    });
    notif.on("click", () => {
        if(callback){
            callback();
            return;
        }
        if(mainWin.isMinimized()){
            mainWin.restore();
        }
        mainWin.focus();
    });
    notif.show();
}

module.exports = createNotif;