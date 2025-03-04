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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbG1TZXR0aW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2svc29ja2V0L2NoYXQvbG9naWMvcmVhbG1TZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFlBQVksTUFBTSxRQUFRLENBQUM7QUFDbEMsT0FBTyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQ3JCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxLQUFLLE1BQU0sa0JBQWtCLENBQUM7QUFDckMsT0FBTyxVQUFVLE1BQU0sbUJBQW1CLENBQUM7QUFLM0MsT0FBTyxrQkFBa0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNyRCxPQUFPLGtCQUFrQixNQUFNLHFCQUFxQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU1RSxPQUFPLEVBQ0gsa0JBQWtCLEVBQ2xCLGtCQUFrQixFQUNyQixDQUFDO0FBRUYsTUFBTSxDQUFDLEtBQUssVUFBVSx1QkFBdUIsQ0FBQyxLQUFrQixFQUFFLE9BQVcsRUFBRSxTQUFhO0lBQ3hGLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDekQsSUFBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RELElBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQztRQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUUxRCxNQUFNLFVBQVUsR0FBRyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELE1BQU0sU0FBUyxHQUFHLE1BQU0sVUFBVSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBRXZILElBQUcsQ0FBQyxTQUFTO1FBQUUsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFFeEYsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBdUIsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDL0YsSUFBRyxDQUFDLE9BQU87UUFBRSxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUU1RixNQUFNLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQztRQUN2QixFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUk7UUFDaEIsSUFBSSxFQUFFLE9BQU87S0FDaEIsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRWxDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDeEMsQ0FBQyJ9