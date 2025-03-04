import hub from "../../hub.js";
import vars from "../../var/var.js";
import { renderHTML } from "../../var/html.js";
import renderUtils from "../render/utils.js";
import apis from "../../api/apis.js";
import apiVars from "../../var/api.js";
import permissionFunc, { PermissionFlags } from "../../utils/perm.js";
import realmUserInteract from "../interact/realmUser.js";
import utils from "../../utils/utils.js";
hub("components/realmUserProfile");
const popup = renderHTML.realmUserProfile;
const realmUserProfile = {
    renderRoles(id, canEditRole = false) {
        const userRoles = vars.realm.users.find(u => u.uid == id)?.roles || [];
        const roles = vars.realm.roles;
        const colorMap = new Map();
        roles.forEach(r => colorMap.set(r.name, r.c));
        const div = popup.querySelector("[data-id=roles]");
        div.innerHTML = "";
        let selfHighestRoleIndex = -1;
        if (canEditRole) {
            const selfRoles = vars.realm.users.find(u => u.uid == vars.user._id)?.roles || [];
            selfHighestRoleIndex = utils.getHighestRoleIndex(selfRoles, vars.realm.roles.map(r => r.name));
        }
        userRoles.forEach(r => {
            const li = document.createElement("li");
            li.style.color = colorMap.get(r) || "var(--txt)";
            li.innerHTML = r;
            div.appendChild(li);
            if (!canEditRole)
                return;
            const index = roles.findIndex(role => role.name == r);
            if (index === -1 || selfHighestRoleIndex === -1)
                return;
            if (index < selfHighestRoleIndex)
                return;
            if (id === vars.user._id && index === selfHighestRoleIndex)
                return;
            const btn = document.createElement("button");
            btn.innerHTML = "X";
            btn.clA("btn");
            btn.addEventListener("click", () => {
                realmUserInteract.removeRole(id, roles.findIndex(role => role.name == r));
                li.remove();
            });
            li.prepend(btn);
        });
    },
    render(id) {
        popup.querySelector("img").src = "/api/profile/img?id=" + id.replace("^", "");
        popup.querySelector("[data-id=name]").innerHTML = apis.www.changeUserID(id);
        popup.setAttribute("data-id", id);
        const user_state = apiVars.user_state[id.replace("^", "")];
        popup.querySelector("[data-id=status]").innerHTML = user_state.status.get() + " | " + user_state.statusText.get();
        const canEditRole = permissionFunc.hasPermission(vars.realm.permission || 0, PermissionFlags.ManageRoles);
        realmUserProfile.renderRoles(id, canEditRole);
        popup.querySelector("[data-role=role]").style.display = canEditRole ? "" : "none";
        popup.querySelector("[data-role=kick]").style.display =
            id != vars.user._id && permissionFunc.hasPermission(vars.realm.permission || 0, PermissionFlags.KickUser)
                ? "" : "none";
        renderUtils.initPopup(popup);
    }
};
export default realmUserProfile;
//# sourceMappingURL=realmUserProfile.js.map