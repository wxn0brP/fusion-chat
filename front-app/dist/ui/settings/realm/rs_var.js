import hub from "../../../hub.js";
import { initCategoryElement } from "./rs_utils.js";
hub("rs/var");
function initCategories(container) {
    return {
        meta: initCategoryElement(container),
        category: initCategoryElement(container),
        editChannel: initCategoryElement(container),
        role: initCategoryElement(container),
        editRole: initCategoryElement(container),
        usersManager: initCategoryElement(container),
        emoji: initCategoryElement(container),
        webhook: initCategoryElement(container),
        editWebhook: initCategoryElement(container),
    };
}
export let rs_data;
export default () => rs_data;
export function setData(self) {
    const { settings, realmId, container } = self;
    rs_data = {
        html: initCategories(container),
        container: container,
        settings: settings,
        realmId: realmId,
        _this: self,
    };
}
//# sourceMappingURL=rs_var.js.map