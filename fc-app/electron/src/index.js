const {
    app,
    BrowserWindow,
    globalShortcut,
} = require("electron");

global.confArg = require("./confArg")();
global.lo = console.log;
global.apiServer = require("./apiServer");
const { sendToFront } = require("./utils");
const createNotif = require("./notif");
require("./ipc");

global.mainWin = null;

async function createWindow(){
    mainWin = new BrowserWindow({
        width: 1700,
        height: 700,
        minWidth: 900,
        minHeight: 400,
        autoHideMenuBar: true,
        webPreferences: {
            preload: __dirname + "/preload.js"
        },
    });
    mainWin.setIcon(__dirname+"/../favicon.png");

    mainWin.loadURL(confArg.link+"/app/");
    mainWin.maximize();

    if(confArg.dev){
        setTimeout(() => {
            sendToFront({ type: "debug", msg: "ready back" });
        }, 5_000);

        registerShortcut("F12", () => {
            mainWin.webContents.toggleDevTools();
        });
    }

    apiServer.start();
    require("./activity");
}

app.on("ready", () => {
    createWindow();
    require("./update")(app.getVersion()).then(res => {
        if(!res) return;
        createNotif("Update", "Update available!", () => {
            require("opn")(confArg.link+"/get?auto=true");
        });
    });
});

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});

app.on("activate", () => {
    if(mainWin === null){
        createWindow();
    }
});

function registerShortcut(key, callback){
    app.on("browser-window-focus", () => globalShortcut.register(key, callback));
    app.on("browser-window-blur", () => globalShortcut.unregister(key));
}