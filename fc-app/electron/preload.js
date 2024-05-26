const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    send: (data) => ipcRenderer.send('electronAPI', data),
});

ipcRenderer.on('electronFront', (event, data) => {
    const ele = document.querySelector("#electronApiDiv");
    const customEvent = new CustomEvent('electronAPI', {
        detail: data
    });
    ele.dispatchEvent(customEvent);
});