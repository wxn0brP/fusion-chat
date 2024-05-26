const {
    app,
    BrowserWindow,
    Notification,
    ipcMain,
} = require('electron');

const lo = console.log;
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

    // if(osType == "win32"){
    //     conf.exitAppB = false;
    //     mainWin.on('close', (event) => {
    //         if(conf.exitAppB) return;
    //         event.preventDefault();
    //         mainWin.hide();
    //     });
    //     var tray = new Tray("favicon.png");
    //     const contextMenu = Menu.buildFromTemplate([
    //         { label: 'Otwórz', click: () => changeState() },
    //         { type: 'separator' },
    //         { label: 'Zamknij', click: () => quitApp() }
    //     ]);
    //     tray.on('click', () => changeState());
    //     tray.on('right-click', () => {
    //         tray.popUpContextMenu(contextMenu);
    //     });
    // }

    mainWin.loadURL(config.link+"/app/index.html");

    setTimeout(() => {
        sendToFront({ type: "debug", msg: "ready back" });
    }, 10_000)
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

// function changeState(){
//     if(mainWin.isFocused()){
//         mainWin.hide();
//     }else{
//         mainWin.show();
//         mainWin.focus();
//     }
// }

// function quitApp(){
//     dialog.showMessageBox(mainWin, {
//         type: 'question',
//         buttons: ['Zamknij', 'Anuluj'],
//         defaultId: 0,
//         title: 'Potwierdzenie',
//         message: 'Czy na pewno chcesz zamknąć aplikację?'
//     })
//     .then((result) => {
//         if(result.response === 0){
//             conf.exitAppB = true;
//             mainWin = null;
//             app.quit();
//         }
//     });
// }