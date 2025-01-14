import valid from "../validData.js";

function getNestedValue(obj, path){
    return path.split(".").reduce((acc, part) => {
        if(Array.isArray(acc) && part === "*") return acc;
        return acc && acc[part];
    }, obj);
}

export function processTemplate(template, data){
    return template.replace(/\$([a-zA-Z0-9_.\[\]*]+)/g, (match, path) => {
        if(path.includes("[*]")){
            const arrayPath = path.split("[*]")[0];
            const fieldPath = path.split("[*]")[1].slice(1);
            const arrayData = getNestedValue(data, arrayPath);
            if(Array.isArray(arrayData)){
                return arrayData.map(item => getNestedValue(item, fieldPath)).join(", ");
            }
        }else{
            return getNestedValue(data, path) || "";
        }
    });
}

function checkRequiredFields(fields, data){
    return fields.every(field => {
      return getNestedValue(data, field) !== undefined;
    });
}

function ajvSchema(schema, data){
    const ajv = valid.objAjv(schema);
    return ajv(data);
}

export function check(webhook, data){
    let isValid = true;

    if(webhook.ajv && !ajvSchema(webhook.ajv, data)) isValid = false;
    if(webhook.required.length > 0 && !checkRequiredFields(webhook.required, data)) isValid = false;

    return isValid;
}