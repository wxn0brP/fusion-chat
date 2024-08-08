const {
    app,
    BrowserWindow,
    Notification,
    ipcMain,
    globalShortcut,
} = require('electron');

global.lo = console.log;
const updateF = require("./update");
const config = require("./config");
const opn = require('opn');

const version = app.getVersion();
var dev = process.argv.length > 2 && process.argv[2] == "-dev";
if(dev){
    if(process.argv[3]) config.link = process.argv[3];
}

var mainWin = null;

async function createWindow(){
    mainWin = new BrowserWindow({
        width: 1700,
        height: 700,
        minWidth: 900,
        minHeight: 400,
        autoHideMenuBar: true,
        webPreferences: {
            preload: __dirname + '/preload.js'
        },
    });
    mainWin.setIcon(__dirname+"/favicon.png");

    mainWin.loadURL(config.link+"/app/");
    mainWin.maximize();

    if(dev){
        setTimeout(() => {
            sendToFront({ type: "debug", msg: "ready back" });
        }, 5_000);

        globalShortcut.register("F12", () => {
            mainWin.webContents.toggleDevTools();
        });
    }
}

app.on('ready', () => { 
    createWindow();
    updateF(version).then(res => {
        if(!res) return;
        createNotif("Update", "Update available!", () => {
            opn(config.link+"/get?auto=true");
        });
    });
});

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit();
    }
});
  
app.on('activate', () => {
    if(mainWin === null){
        createWindow();
    }
});

// if(!dev){
//     app.on('browser-window-focus', function () {
//         globalShortcut.register("CommandOrControl+R", () => {});
//         globalShortcut.register("F5", () => {});
//     });

//     app.on('browser-window-blur', function () {
//         globalShortcut.unregister('CommandOrControl+R');
//         globalShortcut.unregister('F5');
//     });
// }

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

ipcMain.on('electronAPI', async (event, data) => {
    data = JSON.parse(data);
    switch(data.type){
        case "debug":
            lo("from front", data.msg)
        break;
        case "notif":
            if(mainWin.isFocused()) return;
            createNotif(data.title, data.msg);
        break;
    }
});

function sendToFront(data){
    mainWin.webContents.send("electronFront", JSON.stringify(data));
}

function changeState(){
    if(mainWin.isFocused()){
        mainWin.hide();
    }else{
        mainWin.show();
        mainWin.focus();
    }
}