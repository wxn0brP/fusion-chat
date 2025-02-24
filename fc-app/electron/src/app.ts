
import { app, BrowserWindow, globalShortcut } from "electron";
import updateApp from "./start/update";
import vars from "./vars";
import { sendToFront } from "./utils/utils";
import createNotif from "./utils/notif";
import { apiServer_start } from "./os/apiServer";
await import("./os/ipc");

async function createWindow() {
    vars.mainWin = new BrowserWindow({
        width: 1700,
        height: 700,
        minWidth: 900,
        minHeight: 400,
        autoHideMenuBar: true,
        webPreferences: {
            preload: import.meta.dirname + "/preload.js"
        },
    });
    vars.mainWin.setIcon(app.getAppPath() + "/favicon.png");

    vars.mainWin.loadURL(vars.confArg.link + "/app/");
    vars.mainWin.maximize();

    if (vars.confArg.dev) {
        setTimeout(() => {
            sendToFront({ type: "debug", msg: "ready back" });
        }, 5_000);

        registerShortcut("F12", () => {
            vars.mainWin.webContents.toggleDevTools();
        });
    }

    apiServer_start();
    import("./activity");
}

app.on("ready", async () => {
    createWindow();

    updateApp(app.getVersion()).then(res => {
        if (!res) return;
        createNotif("Update", "Update available!", async () => {
            const { default: opn } = await import("opn");
            opn(vars.confArg.link + "/get?auto=true");
        });
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (vars.mainWin === null) {
        createWindow();
    }
});

function registerShortcut(key: string, callback: () => void) {
    app.on("browser-window-focus", () => globalShortcut.register(key, callback));
    app.on("browser-window-blur", () => globalShortcut.unregister(key));
}