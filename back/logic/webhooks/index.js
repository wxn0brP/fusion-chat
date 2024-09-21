import genId from "../../db/gen.js";
import * as validCustom from "./custom.js"; 
import sendMessage from "../sendMessage.js";

export async function addCustom(webhookInfo){
    const { chat, chnl, name, template } = webhookInfo;
    
    const webhook = {
        whid: genId(),
        name,
        template,
        chnl
    }

    if(webhookInfo.ajv) webhook.ajv = webhookInfo.ajv;
    if(webhookInfo.required) webhook.required = webhookInfo.required;

    await global.db.groupSettings.add(chat, webhook, false);
}

export async function handleCustom(query, body){
    const wh = await global.db.groupSettings.findOne(query.chat, { whid: query.id });
    if(!wh) return { code: 404, msg: "Webhook not found" };
    if(query.chnl != wh.chnl) return { code: 400, msg: "Invalid channel" };

    const isValid = validCustom.check(wh, body);
    if(!isValid) return { code: 400, msg: "Invalid data" };

    const formattedMessage = validCustom.processTemplate(wh.template, body);

    const message = {
        to: query.chat,
        chnl: wh.chnl,
        msg: formattedMessage,
        silent: query.silent === "true" || false
    }

    const res = await sendMessage(
        message,
        {
            _id: query.id,
            name: wh.name
        },
        {
            system: true
        }
    );

    if(res.err){
        if(res.err[0] === "error.valid"){
            return { code: 400, msg: "Invalid data" };
        }else{
            return { code: 400, msg: "Invalid data: "+res.err.slice(1).join(", ") };
        }
    }

    return { code: 200, msg: "Webhook processed and message sent" };
}