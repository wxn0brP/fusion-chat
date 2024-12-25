import hub from "../../../hub.js";
hub("rs_meta");

import translateFunc from "../../../utils/translate.js";
import vars from "../../../var/var.js";
import socket from "../../../core/socket/socket.js";
import uiFunc from "../../helpers/uiFunc.js";

export const renderMeta = function(_this){
    const metaDiv = _this.metaDiv;
    metaDiv.innerHTML = `<h1>${translateFunc.get("Basic Settings")}</h1>`;

    const meta = _this.settings.meta;
    meta.tmpData = {};

    const nameInput = _this.initInputText(metaDiv, translateFunc.get("Server name"), meta.name);

    _this.addSeparator(metaDiv, 10);

    const serverImg = document.createElement("img");
    serverImg.id = "settings__serverImg";
    if(meta.img) serverImg.src = "/userFiles/realms/" + _this.realmId + ".png";
    else serverImg.style.display = "none";
    metaDiv.appendChild(serverImg);

    const serverImgFile = document.createElement("input");
    serverImgFile.type = "file";
    serverImgFile.accept = vars.uploadImgTypes.join(", ");
    serverImgFile.addEventListener("change", e => {
        meta.tmpData.img = e.target.files[0];
        serverImg.src = URL.createObjectURL(e.target.files[0]);
        serverImg.style.display = "";
    });

    metaDiv.appendChild(serverImgFile);
    _this.addSeparator(metaDiv, 5);
    _this.initButton(metaDiv, translateFunc.get("Remove image"), () => {
        serverImg.style.display = "none";
        delete meta.tmpData.img;
        meta.img = false;
    });

    _this.addSeparator(metaDiv, 15);
    
    _this.initButton(metaDiv, translateFunc.get("Delete server"), async () => {
        const result = confirm(translateFunc.get("Are you sure you want to delete _this server? ($)", meta.name));
        if(!result) return;
        const result2 = confirm(translateFunc.get("Are you sure you want to delete all data of _this server? ($)", meta.name));
        if(!result2) return;
        const result3 = confirm(translateFunc.get("Are you sure you want to delete all messages of _this server? ($)", meta.name));
        if(!result3) return;

        const name = await uiFunc.prompt("Confirm server name");
        if(name !== meta.name) return uiFunc.uiMsg(translateFunc.get("Wrong server name"));

        _this.exitWithoutSaving();
        coreFunc.changeChat("main");
        setTimeout(() => {
            socket.emit("realm.delete", _this.realmId, name);
        }, 1000);
    }).style.color = "red";

    _this.saveMetaSettings = () => {
        _this.settings.meta.name = nameInput.value;

        if(meta.tmpData.img){
            fileFunc.server(meta.tmpData.img, _this.realmId);
        }

        delete meta.tmpData;
    }
}