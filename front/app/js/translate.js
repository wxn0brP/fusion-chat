const translateFunc = {
    locale: {},

    init(){
        document.querySelectorAll("[translate]").forEach(ele => ele.setAttribute("translate", ele.innerHTML));
        this.localesList = cw.get("lang/list.txt").split("\n");

        let lang = localStorage.getItem("lang");
        if(!lang){
            const navigatorLang = navigator.language.split("-")[0];
            const langIndex = this.localesList.indexOf(navigatorLang);
            lang = langIndex > -1 ? this.localesList[langIndex] : "en";
        }

        this.load(lang);
    },

    load(lang="en"){
        if(this.localesList.indexOf(lang) == -1) return;
        localStorage.setItem("lang", lang);

        if(lang == "en"){
            this.locale = {};
            this.translateHTML();
            return;
        }

        const data = cw.get("lang/"+lang+".jsonc");
        this.locale = utils.parseJSONC(data);
        this.translateHTML();
    },

    translateHTML(){
        document.querySelectorAll("[translate]").forEach(ele => {
            const text = ele.getAttribute("translate");
            ele.innerHTML = this.locale[text] || text;
        });
    },

    get(text, ...data){
        text = this.locale[text] || text;
        return text.replace(/\$/g, () => data.shift() || '$') 
    },
}