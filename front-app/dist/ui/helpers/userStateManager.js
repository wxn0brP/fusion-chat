import apiVars from "../../var/api.js";
import render_realm from "../render/realm.js";
import { updateUserProfileMarker } from "../render/userStatusMarker.js";
import renderUtils from "../render/utils.js";
const dataTemp = apiVars.user_state;
const UserStateManager = {
    _initUser(id) {
        if (!dataTemp[id]) {
            const cb = () => UserStateManager._updateUI(id);
            dataTemp[id] = {
                status: renderUtils.createUpdater(cb, "offline"),
                statusText: renderUtils.createUpdater(cb, ""),
                activity: renderUtils.createUpdater(cb, null),
            };
            UserStateManager._updateUI(id);
        }
    },
    _updateUI(id) {
        render_realm.realmUserStatus(id);
        updateUserProfileMarker(id, dataTemp[id].status.get());
    },
    set(id, data) {
        const { status, statusText, activity } = data;
        UserStateManager._initUser(id);
        if (status)
            dataTemp[id].status.set(status);
        if (statusText)
            dataTemp[id].statusText.set(statusText);
        if (activity)
            dataTemp[id].activity.set(activity);
    }
};
export default UserStateManager;
//# sourceMappingURL=userStateManager.js.map