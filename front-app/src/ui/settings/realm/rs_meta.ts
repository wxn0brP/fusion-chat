import hub from "../../../hub";
hub("rs/meta");

import socket from "../../../core/socket/socket";
import uiFunc from "../../helpers/uiFunc";
import fileFunc from "../../../api/file";
import coreFunc from "../../../core/coreFunc";
import rs_dataF from "./rs_var";
import { addSeparator, initButton, initInputText } from "./rs_utils";
import debugFunc from "../../../core/debug";
import staticData from "../../../var/staticData";
import LangPkg from "../../../utils/translate";

export const renderMeta = function () {
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if (!settings || !settings.meta) return debugFunc.msg(LangPkg.settings_realm.no_data);
    const metaDiv = rs_data.html.meta;
    metaDiv.innerHTML = `<h1>${LangPkg.settings_realm.basic_settings}</h1>`;

    const meta = settings.meta;
    let img: boolean | File = false;

    const nameInput = initInputText(metaDiv, LangPkg.settings_realm.realm_name, meta.name);

    addSeparator(metaDiv, 10);

    const realmImg = document.createElement("img");
    realmImg.id = "settings__realmImg";
    if (meta.img) realmImg.src = "/userFiles/realms/" + rs_data.realmId + ".png";
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
    initButton(metaDiv, LangPkg.settings_realm.remove_image, () => {
        realmImg.style.display = "none";
        meta.img = false;
    });

    addSeparator(metaDiv, 15);

    initButton(metaDiv, LangPkg.settings_realm.delete_realm, async () => {
        const end = "? (" + meta.name + ")";
        const warns = [
            LangPkg.settings_realm.delete_realm_confirm.w1,
            LangPkg.settings_realm.delete_realm_confirm.w2,
            LangPkg.settings_realm.delete_realm_confirm.w3
        ];
        for (const text of warns) {
            const result = await uiFunc.confirm(text + end);
            if (!result) return;
        }

        const name = await uiFunc.prompt("Confirm realm name");
        if (name !== meta.name) return uiFunc.uiMsgT(LangPkg.settings_realm.rename_wrong);

        rs_data._this.exitWithoutSaving();
        coreFunc.changeChat("main");
        setTimeout(() => {
            socket.emit("realm.delete", rs_data.realmId, name);
        }, 1000);
    }).style.color = "red";

    rs_data._this.saveMetaSettings = () => {
        settings.meta.name = nameInput.value;

        if (img)
            fileFunc.realm(img, rs_data.realmId);
    }
}