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

module.exports = {
    sendToFront,
    changeState
}