// @ts-check
import hub from "../../../hub.js";
hub("rs/meta");

import translateFunc from "../../../utils/translate.js";
import vars from "../../../var/var.js";
import socket from "../../../core/socket/socket.js";
import uiFunc from "../../helpers/uiFunc.js";
import fileFunc from "../../../api/file.js";
import coreFunc from "../../../core/coreFunc.js";
import rs_data from "./rs_var.js";
import { addSeparator, initButton, initInputText } from "./rs_utils.js";
import debugFunc from "../../../core/debug.js";

export const renderMeta = function(){
    const settings = rs_data.settings;
    if(!settings || !settings.meta) return debugFunc.msg("No settings data");
    const metaDiv = rs_data.html.meta;
    metaDiv.innerHTML = `<h1>${translateFunc.get("Basic Settings")}</h1>`;

    const meta = settings.meta;
    const tmpData = {};

    const nameInput = initInputText(metaDiv, translateFunc.get("Server name"), meta.name);

    addSeparator(metaDiv, 10);

    const serverImg = document.createElement("img");
    serverImg.id = "settings__serverImg";
    if(meta.img) serverImg.src = "/userFiles/realms/" + rs_data.realmId + ".png";
    else serverImg.style.display = "none";
    metaDiv.appendChild(serverImg);

    const serverImgFile = document.createElement("input");
    serverImgFile.type = "file";
    serverImgFile.accept = vars.uploadImgTypes.join(", ");
    serverImgFile.addEventListener("change", e => {
        // @ts-ignore
        tmpData.img = e.target.files[0];
        // @ts-ignore
        serverImg.src = URL.createObjectURL(e.target.files[0]);
        serverImg.style.display = "";
    });

    metaDiv.appendChild(serverImgFile);
    addSeparator(metaDiv, 5);
    initButton(metaDiv, translateFunc.get("Remove image"), () => {
        serverImg.style.display = "none";
        meta.img = false;
    });

    addSeparator(metaDiv, 15);
    
    initButton(metaDiv, translateFunc.get("Delete server"), async () => {
        const result = confirm(translateFunc.get("Are you sure you want to delete _this server? ($)", meta.name));
        if(!result) return;
        const result2 = confirm(translateFunc.get("Are you sure you want to delete all data of _this server? ($)", meta.name));
        if(!result2) return;
        const result3 = confirm(translateFunc.get("Are you sure you want to delete all messages of _this server? ($)", meta.name));
        if(!result3) return;

        const name = await uiFunc.prompt("Confirm server name");
        if(name !== meta.name) return uiFunc.uiMsg(translateFunc.get("Wrong server name"));

        rs_data._this.exitWithoutSaving();
        coreFunc.changeChat("main");
        setTimeout(() => {
            socket.emit("realm.delete", rs_data.realmId, name);
        }, 1000);
    }).style.color = "red";

    rs_data._this.saveMetaSettings = () => {
        settings.meta.name = nameInput.value;

        if(tmpData.img){
            fileFunc.server(tmpData.img, rs_data.realmId);
        }
    }
}