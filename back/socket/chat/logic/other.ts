import InternalCode from "#codes";
import sendMail from "#logic/mail";
import { createTokenPointer } from "#logic/mobileNotif";
import ogsToEmbed from "#logic/ogToEmbed";
import sendMessage from "#logic/sendMessage";
import * as statusMgmt from "#logic/status";
import * as tokenFunc from "#logic/token/index";
import valid, { validChannelId } from "#logic/validData";
import ValidError from "#logic/validError";
import Id from "#id";
import Db_Mess from "#types/db/mess";
import Status from "#types/socket/chat/status";
import { Socket_StandardRes } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import { genId } from "@wxn0brp/db";
import ogs from "open-graph-scraper";
import embedData from "../valid/embedData";
import statusData from "../valid/status";

const embedDataSchemat = valid.objAjv(embedData);
const statusDataSchemat = valid.objAjv(statusData);

export async function get_ogs(suser: Socket_User, link: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("get.ogs");
    if (!valid.str(link, 0, 300)) return validE.valid("link");
    if (!/^https?:\/\//.test(link)) return validE.valid("link");

    const { error, result } = await ogs({ url: link });
    if (error) return validE.err(error);
    return { err: false, res: [result] };
}

export async function send_embed_og(suser: Socket_User, to: Id, chnl: Id, link: string): Promise<Socket_StandardRes> {
    const validE = new ValidError("send.embed.og");
    if (!valid.id(to)) return validE.valid("to");
    if (!validChannelId(chnl)) return validE.valid("chnl");
    if (!valid.str(link, 0, 300)) return validE.valid("link");
    if (!/^https?:\/\//.test(link)) return validE.valid("link");

    const embed = await ogsToEmbed(link);
    if (!embed) return validE.err(InternalCode.ServerError.Socket.OgEmbed_ErrorFetching);

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
    if (result.err) return validE.err(result.err);
    return { err: false };
}

export async function send_embed_data(suser: Socket_User, to: Id, chnl: Id, embed: Db_Mess.Embed): Promise<Socket_StandardRes> {
    const validE = new ValidError("send.embed.data");
    if (!valid.id(to)) return validE.valid("to");
    if (!validChannelId(chnl)) return validE.valid("chnl");
    if (!embedDataSchemat(embed)) return validE.valid("embed", embedDataSchemat.errors);

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
    if (result.err) return validE.err(result.err);
    return { err: false };
}

export async function fireToken_get(suser: Socket_User, userToken: string): Promise<Socket_StandardRes> {
    const pointer = await createTokenPointer(suser._id, userToken);
    return { err: false, res: [pointer] };
}

export async function status_activity_set(suser: Socket_User, status: Status): Promise<Socket_StandardRes> {
    const validE = new ValidError("status.activity.set");
    if (!statusDataSchemat(status)) return validE.valid("status", statusDataSchemat.errors);

    const endCode = statusMgmt.setCache(suser._id, status);
    if (endCode) return validE.err(endCode);
    return { err: false };
}

export async function status_activity_get(suser: Socket_User, id: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("status.activity.get");
    if (!valid.id(id)) return validE.valid("id");

    const status = statusMgmt.getCache(id);
    return { err: false, res: [status] };
}

export async function status_activity_gets(suser: Socket_User, ids: Id[]): Promise<Socket_StandardRes> {
    const validE = new ValidError("status.activity.gets");
    if (!valid.arrayId(ids)) return validE.valid("ids");

    const states = ids.map(id => statusMgmt.getCache(id));
    return { err: false, res: [states] };
}

export async function status_activity_remove(suser: Socket_User): Promise<Socket_StandardRes> {
    statusMgmt.rmCache(suser._id);
    return { err: false };
}

export async function user_delete(suser: Socket_User): Promise<Socket_StandardRes> {
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