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
    }
}