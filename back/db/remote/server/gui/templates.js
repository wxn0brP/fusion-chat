const templates = {
    load(id){
        const templateEle = document.querySelector("#"+id);
        const html = templateEle.innerHTML;
        const template = Handlebars.compile(html);
        templateEle.remove();
        return template;
    }
}

Handlebars.registerHelper("isObject", function (value){
    return typeof value === "object" && value !== null;
});

Handlebars.registerHelper("json5", function (context){
    const json5 = JSON5.stringify(context, null, 4);
    return json5.substring(1, json5.length - 1);
});

const databasesListTemplate = templates.load("databases-list-template");
const databaseNavTemplate = templates.load("database-nav-template");
const databasesTablesTemplate = templates.load("databases-tables-template");
const dataTemplate = templates.load("data-template");