import hub from "../../hub.js";
hub("settingsServer_emoji");

import translateFunc from "../../utils/translate.js";
import vars from "../../var/var.js";
import socket from "../../core/socket/ws.js";
import fileFunc from "../../api/file.js";

export const renderEmojis = function(_this){
    _this.emojiDiv.innerHTML = `<h1>${translateFunc.get("Emoji Manager")}</h1>`;

    const uploadButton = document.createElement("button");
    uploadButton.innerHTML = translateFunc.get("Upload Emoji");
    uploadButton.onclick = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = vars.uploadImgTypes.join(",");
        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            if(!file) return;
            fileFunc.emocji(file, _this.realmId);
            setTimeout(() => {
                socket.emit("realm.emojis.sync", _this.realmId, (emojis) => {
                    _this.settings.emojis = emojis;
                    _this.renderEmojis();
                });
            }, 1000);
        }
        fileInput.click();
    }

    _this.emojiDiv.appendChild(uploadButton);

    function renderEmoji(emoji){
        const emojiDiv = document.createElement("div");
        emojiDiv.classList.add("emoji__container");
        
        const img = document.createElement("img");
        img.src = "/userFiles/realms/" + _this.realmId + "/emojis/" + emoji.unicode.toString(16) + ".svg";
        img.style.width = "64px";
        emojiDiv.appendChild(img);

        const emojiName = _this.initInputText(emojiDiv, translateFunc.get("Name"), emoji.name);
        emojiName.addEventListener("change", () => {
            emoji.name = emojiName.value;
        });

        _this.initButton(emojiDiv, translateFunc.get("Delete"), () => {
            const emojis = _this.settings.emojis;
           emojis.splice(emojis.indexOf(emoji), 1);
            _this.renderEmojis();
        });

        _this.emojiDiv.appendChild(emojiDiv);
    }

    for(const emoji of _this.settings.emojis){
        renderEmoji(emoji);
    }
}