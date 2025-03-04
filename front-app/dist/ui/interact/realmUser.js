import apis from "../../api/apis.js";
import socket from "../../core/socket/socket.js";
import hub from "../../hub.js";
import LangPkg from "../../utils/translate.js";
import utils from "../../utils/utils.js";
import { renderHTML } from "../../var/html.js";
import { mglInt } from "../../var/mgl.js";
import vars from "../../var/var.js";
import uiFunc from "../helpers/uiFunc.js";
hub("interact/realmUser");
function getId() {
    return renderHTML.realmUserProfile.getAttribute("data-id");
}
const realmUserInteract = {
    removeRole(id, role) {
        socket.emit("realm.user.role.remove", vars.chat.to, id, role);
    },
    async addRole() {
        const id = getId();
        const roles = vars.realm.roles;
        const selfHighestRoleIndex = utils.getHighestRoleIndex(vars.realm.users.find(u => u.uid == vars.user._id)?.roles || [], vars.realm.roles.map(r => r.name));
        if (selfHighestRoleIndex === -1)
            return;
        const userRoles = vars.realm.users.find(u => u.uid == id)?.roles || [];
        const mappedRoles = roles.map((r, i) => { return { name: r.name, i }; });
        const availableRoles = mappedRoles.slice(selfHighestRoleIndex).filter(r => !userRoles.includes(r.name));
        const roleName = await uiFunc.selectPrompt(LangPkg.ui.realm_user_profile.add_role, [
            "",
            ...availableRoles.map(r => r.name)
        ], [""]);
        if (!roleName)
            return;
        const lvl = availableRoles.find(r => r.name == roleName);
        if (!lvl)
            return;
        socket.emit("realm.user.role.add", vars.chat.to, id, lvl.i);
    },
    async kick() {
        const id = getId();
        const conf = await uiFunc.confirm(LangPkg.settings_realm.kick_user + "? <b>" + apis.www.changeUserID(id) + "</b>");
        if (!conf)
            return;
        socket.emit("realm.user.kick", vars.chat.to, id);
    }
};
export default realmUserInteract;
mglInt.realmUserProfile = realmUserInteract;
//# sourceMappingURL=realmUser.js.map