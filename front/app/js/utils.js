const utils = {
    ss(){
        return window.innerWidth < 800;
    },

    isMobile(){
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    parseJSONC(jsonc){
        const json = jsonc.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
        return JSON.parse(json);
    },

    extractTimeFromId(id){
        if(!id) return;
        const timePart = id.split("-")[0];
        const timeUnix = parseInt(timePart, 36);
        return timeUnix;
    },

    formatDateFormUnux(unixTimestamp){
        const date = new Date(unixTimestamp * 1000);

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const formattedDate = `${day}.${month}.${year} ${hours}:${(minutes < 10 ? '0' : '')}${minutes}`;
        return formattedDate;
    },

    validId(id){
        if(!id) return false;
        if(typeof id !== "string") return false;
        if(id.split("-").length != 3) return false;
        return true;
    },

    writeToClipboard(text){
        return new Promise((resolve) => {
            navigator.clipboard.writeText(text).then(() => {
                resolve(true);
            }).catch(() => {
                uiFunc.clipboardError(text);
                resolve(false);
            });
        })
    }
}