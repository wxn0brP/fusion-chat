import { genId } from "@wxn0brp/db";
import * as customWebhookUtils from "./custom.js"; 
import sendMessage from "../sendMessage.js";
import { decode, create, KeyIndex } from "../../logic/token/index.js";
import db from "../../dataBase.js";

export async function addCustom(webhookInfo){
    const { chat, chnl, name, template, ajv, required } = webhookInfo;
    
    const webhook = {
        whid: genId(),
        name,
        template,
        chnl,
        ajv: ajv || {},
        required: required || [],
    }

    const token = await create({
        id: webhook.whid,
        chat,
    }, false, KeyIndex.WEBHOOK_TOKEN);

    webhook.token = token;

    await db.realmConf.add(chat, webhook, false);
}

export async function handleCustom(query, body){
    const token = await decode(query.token, KeyIndex.WEBHOOK_TOKEN);
    
    if(!token) return { code: 400, msg: "Invalid token" };

    const wh = await db.realmConf.findOne(token.chat, { whid: token.id });
    if(!wh) return { code: 404, msg: "Webhook not found" };

    const isValid = customWebhookUtils.check(wh, body);
    if(!isValid) return { code: 400, msg: "Invalid data" };

    const formattedMessage = customWebhookUtils.processTemplate(wh.template, body);

    const message = {
        to: token.chat,
        chnl: wh.chnl,
        msg: formattedMessage,
        silent: query.silent === "true" || false
    }

    let embed = null;
    if(wh.embed){
        const { title, description, url, image, customFields } = wh.embed;
        embed = {
            title: customWebhookUtils.processTemplate(title, body),
        }
        if(description) embed.description = customWebhookUtils.processTemplate(description, body);
        if(url) embed.url = customWebhookUtils.processTemplate(url, body);
        if(image) embed.image = customWebhookUtils.processTemplate(image, body);
        if(customFields){
            embed.customFields = {};
            for(const [key, value] of Object.entries(customFields)){
                embed.customFields[key] = customWebhookUtils.processTemplate(value, body);
            }
        }
    }

    const res = await sendMessage(
        message,
        {
            _id: wh.whid,
            name: wh.name
        },
        {
            system: true,
            customFields: {
                embed: embed ? embed : undefined
            },
            frPrefix: "%",
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