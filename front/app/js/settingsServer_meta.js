SettingsServerManager.prototype.renderMeta = function(){
    const metaDiv = this.metaDiv;
    metaDiv.innerHTML = `<h1>${translateFunc.get("Basic Settings")}</h1>`;

    const meta = this.settings.meta;
    meta.tmpData = {};

    const nameInput = this.initInputText(metaDiv, translateFunc.get("Server name"), meta.name);

    this.addSeparator(metaDiv, 10);

    const serverImg = document.createElement("img");
    serverImg.id = "settings__serverImg";
    if(meta.img) serverImg.src = "/userFiles/realms/" + this.realmId + ".png";
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
    this.addSeparator(metaDiv, 5);
    this.initButton(metaDiv, translateFunc.get("Remove image"), () => {
        serverImg.style.display = "none";
        delete meta.tmpData.img;
        meta.img = false;
    });

    this.addSeparator(metaDiv, 15);
    
    this.initButton(metaDiv, translateFunc.get("Delete server"), async () => {
        const result = confirm(translateFunc.get("Are you sure you want to delete this server? ($)", meta.name));
        if(!result) return;
        const result2 = confirm(translateFunc.get("Are you sure you want to delete all data of this server? ($)", meta.name));
        if(!result2) return;
        const result3 = confirm(translateFunc.get("Are you sure you want to delete all messages of this server? ($)", meta.name));
        if(!result3) return;

        const name = await uiFunc.prompt("Confirm server name");
        if(name !== meta.name) return uiFunc.uiMsg(translateFunc.get("Wrong server name"));

        this.exitWithoutSaving();
        coreFunc.changeChat("main");
        setTimeout(() => {
            socket.emit("realm.delete", this.realmId, name);
        }, 1000);
    }).style.color = "red";

    this.saveMetaSettings = () => {
        this.settings.meta.name = nameInput.value;

        if(meta.tmpData.img){
            fileFunc.server(meta.tmpData.img, this.realmId);
        }

        delete meta.tmpData;
    }
}