SettingsServerManager.prototype.renderEmojis = function(){
    this.emojiDiv.innerHTML = `<h1>${translateFunc.get("Emoji Manager")}</h1>`;
    const _this = this;

    const uploadButton = document.createElement("button");
    uploadButton.innerHTML = translateFunc.get("Upload Emoji");
    uploadButton.onclick = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = vars.uploadImgTypes.join(",");
        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            if(!file) return;
            fileFunc.emocji(file, this.serverId);
            setTimeout(() => {
                socket.emit("server.emojis.sync", this.serverId, (emojis) => {
                    _this.settings.emojis = emojis;
                    _this.renderEmojis();
                });
            }, 1000);
        }
        fileInput.click();
    }

    this.emojiDiv.appendChild(uploadButton);

    function renderEmoji(emoji){
        const emojiDiv = document.createElement("div");
        emojiDiv.classList.add("emoji__container");
        
        const img = document.createElement("img");
        img.src = "/userFiles/servers/" + _this.serverId + "/emojis/" + emoji.unicode.toString(16) + ".svg";
        img.style.width = "64px";
        emojiDiv.appendChild(img);

        const emojiName = _this.initInputText(emojiDiv, translateFunc.get("Name"), emoji.name);
        emojiName.addEventListener("change", () => {
            emoji.name = emojiName.value;
        });

        const deleteButton = _this.initButton(emojiDiv, translateFunc.get("Delete"), () => {
            const emojis = _this.settings.emojis;
           emojis.splice(emojis.indexOf(emoji), 1);
            _this.renderEmojis();
        });

        _this.emojiDiv.appendChild(emojiDiv);
    }

    for(const emoji of this.settings.emojis){
        renderEmoji(emoji);
    }
}