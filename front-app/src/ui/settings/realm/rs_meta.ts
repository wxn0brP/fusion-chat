import hub from "../../../hub";
hub("rs/meta");

import translateFunc from "../../../utils/translate";
import socket from "../../../core/socket/socket";
import uiFunc from "../../helpers/uiFunc";
import fileFunc from "../../../api/file";
import coreFunc from "../../../core/coreFunc";
import rs_dataF from "./rs_var";
import { addSeparator, initButton, initInputText } from "./rs_utils";
import debugFunc from "../../../core/debug";
import staticData from "../../../var/staticData";

export const renderMeta = function(){
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if(!settings || !settings.meta) return debugFunc.msg("No settings data");
    const metaDiv = rs_data.html.meta;
    metaDiv.innerHTML = `<h1>${translateFunc.get("Basic Settings")}</h1>`;

    const meta = settings.meta;
    let img: boolean | File = false;

    const nameInput = initInputText(metaDiv, translateFunc.get("Realm name"), meta.name);

    addSeparator(metaDiv, 10);

    const realmImg = document.createElement("img");
    realmImg.id = "settings__realmImg";
    if(meta.img) realmImg.src = "/userFiles/realms/" + rs_data.realmId + ".png";
    else realmImg.style.display = "none";
    metaDiv.appendChild(realmImg);

    const realmImgFile = document.createElement("input");
    realmImgFile.type = "file";
    realmImgFile.accept = staticData.uploadImgTypes.join(", ");
    realmImgFile.addEventListener("change", e => {
        // @ts-ignore
        tmpData.img = e.target.files[0];
        // @ts-ignore
        realmImg.src = URL.createObjectURL(e.target.files[0]);
        realmImg.style.display = "";
    });

    metaDiv.appendChild(realmImgFile);
    addSeparator(metaDiv, 5);
    initButton(metaDiv, translateFunc.get("Remove image"), () => {
        realmImg.style.display = "none";
        meta.img = false;
    });

    addSeparator(metaDiv, 15);
    
    initButton(metaDiv, translateFunc.get("Delete realm"), async () => {
        const result = confirm(translateFunc.get("Are you sure you want to delete this realm? ($)", meta.name));
        if(!result) return;
        const result2 = confirm(translateFunc.get("Are you sure you want to delete all data of this realm? ($)", meta.name));
        if(!result2) return;
        const result3 = confirm(translateFunc.get("Are you sure you want to delete all messages of this realm? ($)", meta.name));
        if(!result3) return;

        const name = await uiFunc.prompt("Confirm realm name");
        if(name !== meta.name) return uiFunc.uiMsg(translateFunc.get("Wrong realm name"));

        rs_data._this.exitWithoutSaving();
        coreFunc.changeChat("main");
        setTimeout(() => {
            socket.emit("realm.delete", rs_data.realmId, name);
        }, 1000);
    }).style.color = "red";

    rs_data._this.saveMetaSettings = () => {
        settings.meta.name = nameInput.value;

        if(img)
            fileFunc.realm(img, rs_data.realmId);
    }
}