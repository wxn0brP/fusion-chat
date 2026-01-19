import { Core_socket__user_status_type } from "#types/core/socket";
import { Id } from "#types/Id";
import { Ui_UserState } from "#types/ui/render";
import { Vars_user__activity } from "#types/var";
import { createUpdater } from "#ui/render/utils";
import { apiVars } from "#var/api";
import { uir_realm } from "../render/realm";
import { uir_updateUserProfileMarker } from "../render/userStatusMarker";

const dataTemp = apiVars.user_state;

function initUser(id: Id) {
    if (!dataTemp[id]) {
        const cb = () => updateUI(id);
        dataTemp[id] = {
            status: createUpdater<Core_socket__user_status_type>(cb, "offline"),
            statusText: createUpdater<string>(cb, ""),
            activity: createUpdater<Vars_user__activity | null>(cb, null),
        }
        updateUI(id);
    }
}

function updateUI(id: Id) {
    uir_realm.realmUserStatus(id);
    uir_updateUserProfileMarker(id, dataTemp[id].status.get());
}

export function uih_setUserState(id: Id, data: Ui_UserState) {
    const { status, statusText, activity } = data;
    initUser(id);

    if (status) dataTemp[id].status.set(status);
    if (statusText) dataTemp[id].statusText.set(statusText);
    if (activity) dataTemp[id].activity.set(activity);
}