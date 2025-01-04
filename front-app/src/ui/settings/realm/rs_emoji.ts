import hub from "../../../hub";
hub("rs/emoji");

import translateFunc from "../../../utils/translate";
import vars from "../../../var/var";
import socket from "../../../core/socket/socket";
import fileFunc from "../../../api/file";
import debugFunc from "../../../core/debug";
import rs_dataF from "./rs_var";
import { initButton, initInputText } from "./rs_utils";
import { Settings_rs__Emoji } from "./types";

export const renderEmojis = function(){
    const rs_data = rs_dataF();
    const settings = rs_data.settings;
    if(!settings || !settings.emojis) return debugFunc.msg("No settings data");
    rs_data.html.emoji.innerHTML = `<h1>${translateFunc.get("Emoji Manager")}</h1>`;

    const uploadButton = document.createElement("button");
    uploadButton.innerHTML = translateFunc.get("Upload Emoji");
    uploadButton.onclick = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = vars.uploadImgTypes.join(",");
        fileInput.onchange = async () => {
            // @ts-ignore
            const file = fileInput.files[0];
            if(!file) return;
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
    function renderEmoji(emoji: Settings_rs__Emoji){
        const emojiDiv = document.createElement("div");
        emojiDiv.classList.add("emoji__container");
        
        const img = document.createElement("img");
        img.src = "/userFiles/realms/" + rs_data.realmId + "/emojis/" + emoji.unicode.toString(16) + ".svg";
        img.style.width = "64px";
        emojiDiv.appendChild(img);

        const emojiName = initInputText(emojiDiv, translateFunc.get("Name"), emoji.name);
        emojiName.addEventListener("change", () => {
            emoji.name = emojiName.value;
        });

        initButton(emojiDiv, translateFunc.get("Delete"), () => {
            const emojis = settings.emojis;
           emojis.splice(emojis.indexOf(emoji), 1);
            renderEmojis();
        });

        rs_data.html.emoji.appendChild(emojiDiv);
    }

    for(const emoji of settings.emojis){
        renderEmoji(emoji);
    }
}