import valid from "../../../logic/validData.js";
import ogs from "open-graph-scraper";
import ogsToEmbed from "../../../logic/ogToEmbed.js";
import sendMessage from "../../../logic/sendMessage.js";
import embedData from "../valid/embedData.js";
import ValidError from "../../../logic/validError.js";
import { createTokenPointer } from "../../../logic/mobileNotif.js";
import * as statusMgmt from "../../../logic/status.js";
import statusData from "../valid/status.js";
import sendMail from "../../../logic/mail.js";
import * as tokenFunc from "../../../logic/token/index.js";
import { genId } from "@wxn0brp/db";

const embedDataShema = valid.objAjv(embedData);
const statusDataShema = valid.objAjv(statusData);

export async function get_ogs(link){
    const validE = new ValidError("get.ogs");
    if(!valid.str(link, 0, 300)) return validE.valid("link");
    if(!/^https?:\/\//.test(link)) return validE.valid("link");

    const { error, result } = await ogs({ url: link });
    if(error) return validE.err(error);
    return { err: false, res: result };
}

export async function send_embed_og(suser, to, chnl, link){
    const validE = new ValidError("send.embed.og");
    if(!valid.id(to)) return validE.valid("to");
    if(!valid.idOrSpecyficStr(chnl, ["main"])) return validE.valid("chnl");
    if(!valid.str(link, 0, 300)) return validE.valid("link");
    if(!/^https?:\/\//.test(link)) return validE.valid("link");

    const embed = await ogsToEmbed(link);
    if(!embed) return validE.err("ogToEmbed error");
    
    const result = await sendMessage(
        {
            to, chnl, msg: "Embed",
        },
        suser,
        {
            customFields: {
                embed: embed
            }
        }
    );
    if(result.err) return validE.err(result.err);
    return { err: false };
}

export async function send_embed_data(suser, to, chnl, embed){
    const validE = new ValidError("send.embed.data");
    if(!valid.id(to)) return validE.valid("to");
    if(!valid.idOrSpecyficStr(chnl, ["main"])) return validE.valid("chnl");

    if(!embedDataShema(embed)) return validE.valid("embed", embedDataShema.errors);
    const result = await sendMessage(
        {
            to, chnl, msg: "Embed",
        },
        suser,
        {
            customFields: {
                embed
            }
        }
    );
    if(result.err) return validE.err(result.err);
    return { err: false };
}

export async function fireToken_get(suser, userToken){
    const pointer = await createTokenPointer(suser._id, userToken);
    return pointer;
}

export async function status_activity_set(suser, status){
    const validE = new ValidError("status.activity.set");
    if(!statusDataShema(status)) return validE.valid("status", statusDataShema.errors);
    
    const endCode = statusMgmt.setCache(suser._id, status);
    if(endCode) return validE.err(endCode);
    return { err: false };
}

export async function status_activity_get(id){
    const validE = new ValidError("status.activity.get");
    if(!valid.id(id)) return validE.valid("id");

    const status = statusMgmt.getCache(id);
    return { err: false, res: status };
}

export async function status_activity_gets(ids){
    const validE = new ValidError("status.activity.gets");
    if(!valid.arrayId(ids)) return validE.valid("ids");

    const states = ids.map(id => statusMgmt.getCache(id));
    return { err: false, res: states };
}

export async function status_activity_remove(suser){
    statusMgmt.rmCache(suser._id);
    return { err: false };    
}

export async function user_delete(suser){
    const domain = process.env.DOMAIN || "https://fusion.ct8.pl";
    const id = genId();
    const token = await tokenFunc.create({
        _id: id,
        user: suser._id,
    }, "1d", tokenFunc.KeyIndex.GENERAL);
    const confirmLink = `${domain}/rm/account-confirm?token=${token}`;
    const cancelLink = `${domain}/rm/account-undo?token=${token}`;

    sendMail("confirmDeleteAccount", suser.email, suser.name, confirmLink, cancelLink);
    return { err: false };
}