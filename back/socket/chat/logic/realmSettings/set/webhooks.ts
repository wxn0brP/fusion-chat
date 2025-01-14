import db from "../../../../../dataBase.js";
import { addCustom } from "../../../../../logic/webhooks/index.js";
import Logic_Webhook from "../../../../../types/logic/webhook.js";
import { processDbChanges } from "./imports.js";
import { saveDbChanges } from "./utils.js";

export default async (id, data, suser, dbData) => {
    const oldWebhooks = dbData.filter(d => !!d.whid);
    const changes = processDbChanges(
        oldWebhooks,
        data.webhooks,
        ["name", "template", "chnl", "require", "ajv", "embed"],
        "whid"
    );
    
    const itemsToAdd = [...changes.itemsToAdd];
    changes.itemsToAdd = [];
    await saveDbChanges(id, changes, "whid");

    for(const item of itemsToAdd){
        const webhookInfo: Logic_Webhook.webhook_builder = {
            name: item.name,
            chat: id,
            chnl: item.chnl,
            template: item.template,
            required: item.require || [],
            ajv: item.ajv || {}
        };
        await addCustom(webhookInfo);
    }

    for(const item of changes.itemsToRemove){
        await db.data.add("rm", { _id: item.whid });
    }
}