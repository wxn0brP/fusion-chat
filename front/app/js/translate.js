const translateFunc = {
    locale: {},
    categories: [
        "html-ui", "js-ui", "socket", "other",
    ],

    init(){
        document.querySelectorAll("[translate]").forEach(ele => ele.setAttribute("translate", ele.innerHTML));
        this.localesList = cw.get("lang/list.txt").split("\n");
        this.localesList.unshift("en");

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
        this.locale = {};

        if(lang == "en"){
            this.translateHTML();
            return;
        }

        this.categories.forEach(cat => {
            const data = cw.get(`lang/${lang}/${cat}.jsonc`);
            this.locale[cat] = utils.parseJSONC(data);
        });

        this.translateHTML();
    },

    translateHTML(){
        document.querySelectorAll("[translate]").forEach(ele => {
            const text = ele.getAttribute("translate");
            ele.innerHTML = translateFunc.get(text);
        });
    },

    get(text, ...data){
        for(const key of Object.keys(this.locale)){
            const cat = this.locale[key];
            if(cat[text]) text = cat[text];
        }

        return text.replace(/\$/g, () => data.shift() || '$') 
    },
}