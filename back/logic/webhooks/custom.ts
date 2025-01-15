import Db_RealmConf from "../../types/db/realmConf.js";
import valid from "../validData.js";

function getNestedValue(obj: object, path: string) {
    return path.split('.').reduce((current, part) => {
        if (part.includes('[') && part.includes(']')) {
            const [arrayName, indexStr] = part.split('[');
            const index = parseInt(indexStr.replace(']', ''));
            return current[arrayName][index];
        }
        return current[part];
    }, obj);
};

export function processTemplate(template: string, obj: object) {
    return template.replace(/\$([a-zA-Z0-9\[\]._]+)/g, (match, path) => {
        try {
            const value = getNestedValue(obj, path);
            return value !== undefined ? value : match;
        } catch (error) {
            return match;
        }
    });
}

function checkRequiredFields(fields: string[], data: object) {
    return fields.every(field => {
        return getNestedValue(data, field) !== undefined;
    });
}

function ajvSchema(schema: object, data: object) {
    const ajv = valid.objAjv(schema);
    return ajv(data);
}

export function check(webhook: Db_RealmConf.webhook, data: object) {
    let isValid = true;

    if (webhook.ajv && !ajvSchema(webhook.ajv, data)) isValid = false;
    if (webhook.required.length > 0 && !checkRequiredFields(webhook.required, data)) isValid = false;

    return isValid;
}