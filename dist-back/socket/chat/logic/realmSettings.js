import InternalCode from "../../../codes/index.js";
import db from "../../../dataBase.js";
import { create } from "../../../logic/token/index.js";
import { KeyIndex } from "../../../logic/token/KeyManager.js";
import valid from "../../../logic/validData.js";
import ValidError from "../../../logic/validError.js";
import realm_settings_get from "./realmSettings/get.js";
import realm_settings_set from "./realmSettings/set.js";
import { Permissions, PermissionSystem } from "./realmSettings/set/imports.js";
export { realm_settings_get, realm_settings_set };
export async function realm_webhook_token_get(suser, realmId, webhookId) {
    const validE = new ValidError("realm.webhook.token.get");
    if (!valid.id(realmId))
        return validE.valid("realmId");
    if (!valid.id(webhookId))
        return validE.valid("webhookId");
    const permSystem = new PermissionSystem(realmId);
    const userPerms = await permSystem.canUserPerformAnyAction(suser._id, [Permissions.admin, Permissions.manageWebhooks]);
    if (!userPerms)
        return validE.err(InternalCode.UserError.Socket.RealmEdit_NotAuthorized);
    const webhook = await db.realmConf.findOne(realmId, { whid: webhookId });
    if (!webhook)
        return validE.err(InternalCode.UserError.Socket.RealmWebhookTokenGet_NotFound);
    const token = await create({
        id: webhook.whid,
        chat: realmId,
    }, false, KeyIndex.WEBHOOK_TOKEN);
    return { err: false, res: [token] };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbG1TZXR0aW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2svc29ja2V0L2NoYXQvbG9naWMvcmVhbG1TZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzNELE9BQU8sS0FBSyxNQUFNLDBCQUEwQixDQUFDO0FBQzdDLE9BQU8sVUFBVSxNQUFNLDJCQUEyQixDQUFDO0FBS25ELE9BQU8sa0JBQWtCLE1BQU0scUJBQXFCLENBQUM7QUFDckQsT0FBTyxrQkFBa0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFNUUsT0FBTyxFQUNILGtCQUFrQixFQUNsQixrQkFBa0IsRUFDckIsQ0FBQTtBQUVELE1BQU0sQ0FBQyxLQUFLLFVBQVUsdUJBQXVCLENBQUMsS0FBa0IsRUFBRSxPQUFXLEVBQUUsU0FBYTtJQUN4RixNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3pELElBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztRQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0RCxJQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUM7UUFBRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFMUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRCxNQUFNLFNBQVMsR0FBRyxNQUFNLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUV2SCxJQUFHLENBQUMsU0FBUztRQUFFLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBRXhGLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQXVCLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQy9GLElBQUcsQ0FBQyxPQUFPO1FBQUUsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFFNUYsTUFBTSxLQUFLLEdBQUcsTUFBTSxNQUFNLENBQUM7UUFDdkIsRUFBRSxFQUFFLE9BQU8sQ0FBQyxJQUFJO1FBQ2hCLElBQUksRUFBRSxPQUFPO0tBQ2hCLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUVsQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQ3hDLENBQUMifQ==