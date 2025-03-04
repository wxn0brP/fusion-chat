import { saveDbChanges } from "./utils";
import { Settings_AllData } from "../set";
import Logic_Webhook from "#types/logic/webhook";
import { addCustom } from "#logic/webhooks/index";
import { db, Id, processDbChanges, Socket_RealmSettings, Socket_User } from "./imports";

export default async (id: Id, data: Socket_RealmSettings, suser: Socket_User, dbData: Settings_AllData) => {
    const oldWebhooks = dbData.filter(d => "whid" in d);
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