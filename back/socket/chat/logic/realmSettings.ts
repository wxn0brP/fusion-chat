import InternalCode from "#codes";
import db from "#db";
import { create } from "#logic/token/index";
import { KeyIndex } from "#logic/token/KeyManager";
import valid from "#logic/validData";
import ValidError from "#logic/validError";
import Id from "#id";
import Db_RealmConf from "#types/db/realmConf";
import { Socket_StandardRes } from "#types/socket/res";
import { Socket_User } from "#types/socket/user";
import realm_settings_get from "./realmSettings/get";
import realm_settings_set from "./realmSettings/set";
import { Permissions, PermissionSystem } from "./realmSettings/set/imports";

export {
    realm_settings_get,
    realm_settings_set
};

export async function realm_webhook_token_get(suser: Socket_User, realmId: Id, webhookId: Id): Promise<Socket_StandardRes> {
    const validE = new ValidError("realm.webhook.token.get");
    if(!valid.id(realmId)) return validE.valid("realmId");
    if(!valid.id(webhookId)) return validE.valid("webhookId");

    const permSystem = new PermissionSystem(realmId);
    const userPerms = await permSystem.canUserPerformAnyAction(suser._id, [Permissions.admin, Permissions.manageWebhooks]);

    if(!userPerms) return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);

    const webhook = await db.realmConf.findOne<Db_RealmConf.webhook>(realmId, { whid: webhookId });
    if(!webhook) return validE.err(InternalCode.UserError.Socket.RealmWebhookTokenGet_NotFound);

    const token = await create({
        id: webhook.whid,
        chat: realmId,
    }, false, KeyIndex.WEBHOOK_TOKEN);

    return { err: false, res: [token] };
}