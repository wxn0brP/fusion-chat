
import { vars } from "#var/var";
import { Id } from "#types/Id";
import { renderHTML } from "#var/html";
import { apis } from "#api/apis";
import { apiVars } from "#var/api";
import { permissionFunc, PermissionFlags } from "#utils/perm";
import { realmUserInteract } from "../interact/realmUser";
import { utils } from "#utils/utils"; import { initPopup } from "#ui/render/utils";
const popup = renderHTML.realmUserProfile;

export namespace realmUserProfile {
    export function renderRoles(id: Id, canEditRole: boolean = false) {
        const userRoles = vars.realm.users.find(u => u.uid == id)?.roles || [];
        const roles = vars.realm.roles;
        const colorMap = new Map<string, string>();
        roles.forEach(r => colorMap.set(r.name, r.c));

        const div = popup.querySelector("[data-id=roles]") as HTMLUListElement;
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

            if (!canEditRole) return;
            const index = roles.findIndex(role => role.name == r);
            if (index === -1 || selfHighestRoleIndex === -1) return;
            if (index < selfHighestRoleIndex) return;
            if (id === vars.user._id && index === selfHighestRoleIndex) return;

            const btn = document.createElement("button");
            btn.innerHTML = "X";
            btn.clA("btn");
            btn.addEventListener("click", () => {
                realmUserInteract.removeRole(id, roles.findIndex(role => role.name == r));
                li.remove();
            });
            li.prepend(btn);
        });
    }

    export async function render(id: Id) {
        popup.querySelector<HTMLImageElement>("img").src = "/api/profile/img?id=" + id.replace("^", "");
        popup.querySelector("[data-id=name]").innerHTML = await apis.www.changeUserID(id);
        popup.setAttribute("data-id", id);

        const user_state = apiVars.user_state[id.replace("^", "")];
        popup.querySelector("[data-id=status]").innerHTML = user_state.status.get() + " | " + user_state.statusText.get();

        const canEditRole = permissionFunc.hasPermission(vars.realm.permission || 0, PermissionFlags.ManageRoles);
        realmUserProfile.renderRoles(id, canEditRole);

        popup.querySelector<HTMLButtonElement>("[data-role=role]").style.display = canEditRole ? "" : "none";
        popup.querySelector<HTMLButtonElement>("[data-role=kick]").style.display =
            id != vars.user._id && permissionFunc.hasPermission(vars.realm.permission || 0, PermissionFlags.KickUser)
                ? "" : "none";
        initPopup(popup);
    }
}