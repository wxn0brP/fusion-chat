import hub from "../../../hub";
hub("rs/emoji");

import socket from "../../../core/socket/socket";
import fileFunc from "../../../api/file";
import debugFunc, { LogLevel } from "../../../core/debug";
import rs_dataF from "./rs_var";
import { initButton, initInputText } from "./rs_utils";
import { Settings_rs__Emoji } from "./types";
import staticData from "../../../var/staticData";
import LangPkg from "../../../utils/translate";

export const renderEmojis = function () {
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if (!settings || !settings.emojis) return debugFunc.msg(LogLevel.ERROR, LangPkg.settings_realm.no_data);
    rs_data.html.emoji.innerHTML = `<h1>${LangPkg.settings_realm.emoji_manager}</h1>`;

    const uploadButton = document.createElement("button");
    uploadButton.innerHTML = LangPkg.settings_realm.upload_emoji;
    uploadButton.onclick = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = staticData.uploadImgTypes.join(",");
        fileInput.onchange = async () => {
            // @ts-ignore
            const file = fileInput.files[0];
            if (!file) return;
            fileFunc.emocji(file, rs_data.realmId);
            setTimeout(() => {
                socket.emit("realm.emojis.sync", rs_data.realmId, (emojis) => {
                    settings.emojis = emojis;
                    renderEmojis();
                });
            }, 1000);
        }
        fileInput.click();
    }

    rs_data.html.emoji.appendChild(uploadButton);

    /**
     * Renders an emoji element with its associated image, name input, and delete button.
     */
    function renderEmoji(emoji: Settings_rs__Emoji) {
        const emojiDiv = document.createElement("div");
        emojiDiv.classList.add("emoji__container");

        const img = document.createElement("img");
        img.src = "/userFiles/realms/" + rs_data.realmId + "/emojis/" + emoji.emoji + ".png";
        img.style.width = "64px";
        emojiDiv.appendChild(img);

        const emojiName = initInputText(emojiDiv, LangPkg.settings.name, emoji.name);
        emojiName.addEventListener("change", () => {
            emoji.name = emojiName.value;
        });

        initButton(emojiDiv, LangPkg.uni.delete, () => {
            const emojis = settings.emojis;
            emojis.splice(emojis.indexOf(emoji), 1);
            renderEmojis();
        });

        rs_data.html.emoji.appendChild(emojiDiv);
    }

    for (const emoji of settings.emojis) {
        renderEmoji(emoji);
    }
}