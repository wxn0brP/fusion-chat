const templateFunc = {
    compile(selector){
        const ele = document.querySelector(selector);
        const template = ele.innerHTML;
        ele.remove();
        const templateFunc = Handlebars.compile(template);
        return templateFunc;
    },

    registerPartial(name, selector){
        const ele = document.querySelector(selector);
        const template = ele.innerHTML;
        ele.remove();
        Handlebars.registerPartial(name, template);
    }
}

templateFunc.registerPartial("permissionsForm", "#permissionsFormTemplate");
const templates = {
    listBot: templateFunc.compile("#t_listBot"),
    editBot: templateFunc.compile("#t_editBot"),
}