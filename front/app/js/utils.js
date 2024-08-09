const utils = {
    ss(){
        return window.innerWidth < 800;
    },

    parseJSONC(jsonc){
        const json = jsonc.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
        return JSON.parse(json);
    }
}