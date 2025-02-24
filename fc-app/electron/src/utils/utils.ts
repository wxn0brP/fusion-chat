import vars from "../vars";

function sendToFront(data: any) {
    vars.mainWin.webContents.send("electronFront", JSON.stringify(data));
}

function changeState() {
    if (vars.mainWin.isFocused()) {
        vars.mainWin.hide();
    } else {
        vars.mainWin.show();
        vars.mainWin.focus();
    }
}

export {
    sendToFront,
    changeState
}
