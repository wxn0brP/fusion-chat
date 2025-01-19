import db from "../../../../../dataBase";
import { addCustom } from "../../../../../logic/webhooks/index";
import Logic_Webhook from "../../../../../types/logic/webhook";
import { processDbChanges } from "./imports";
import { saveDbChanges } from "./utils";

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