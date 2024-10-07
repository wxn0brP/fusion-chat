import valid from "../../../logic/validData.js";
import ogs from "open-graph-scraper";
import ogsToEmbed from "../../../logic/ogToEmbed.js";
import sendMessage from "../../../logic/sendMessage.js";
import embedData from "../valid/embedData.js";
import ValidError from "../../../logic/validError.js";

const embedDataShema = valid.objAjv(embedData);

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