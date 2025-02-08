import { Core_socket__user_status_type } from "../../types/core/socket";
import Id from "../../types/Id";
import { Ui_UserState } from "../../types/ui/render";
import { Vars_user__activity } from "../../types/var";
import apiVars from "../../var/api";
import render_realm from "../render/realm";
import { updateUserProfileMarker } from "../render/userStatusMarker";
import renderUtils from "../render/utils";

const dataTemp = apiVars.user_state;

const UserStateManager = {
    _initUser(id: Id) {
        if (!dataTemp[id]) {
            const cb = () => UserStateManager._updateUI(id);
            dataTemp[id] = {
                status: renderUtils.createUpdater<Core_socket__user_status_type>(cb, "offline"),
                statusText: renderUtils.createUpdater<string>(cb, ""),
                activity: renderUtils.createUpdater<Vars_user__activity | null>(cb, null),
            }
            UserStateManager._updateUI(id);
        }
    },

    _updateUI(id: Id) {
        render_realm.realmUserStatus(id);
        updateUserProfileMarker(id, dataTemp[id].status.get());
    },

    set(id: Id, data: Ui_UserState) {
        const { status, statusText, activity } = data;
        UserStateManager._initUser(id);

        if(status) dataTemp[id].status.set(status);
        if(statusText) dataTemp[id].statusText.set(statusText);
        if(activity) dataTemp[id].activity.set(activity);
    }
}

export default UserStateManager;