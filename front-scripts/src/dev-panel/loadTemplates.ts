import Handlebars from "handlebars";

const templateFunc = {
    compile(selector: string){
        const ele = document.querySelector(selector);
        const template = ele.innerHTML;
        ele.remove();
        const templateFunc = Handlebars.compile(template);
        return templateFunc;
    },

    registerPartial(name: string, selector: string){
        const ele = document.querySelector(selector);
        const template = ele.innerHTML;
        ele.remove();
        Handlebars.registerPartial(name, template);
    }
}

const templates = {
    listBot: templateFunc.compile("#template_listBot"),
    menageBot: templateFunc.compile("#template_menageBot"),
    botRealms: templateFunc.compile("#template_botRealms")
}

export default templates;