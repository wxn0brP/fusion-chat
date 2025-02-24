import hub from "../hub.js";
import { mglVar } from "./mgl.js";
hub("var");
const vars = {
    user: {
        _id: localStorage.getItem("user_id"),
        fr: localStorage.getItem("from"),
        status: "online",
        statusText: "",
    },
    chat: {
        to: "main",
        chnl: "main",
        actMess: 0,
        pinned: [],
        selectedMess: null
    },
    temp: {
        scrollBlock: false,
        replyId: null,
        editId: null,
    },
    privs: [],
    realms: [],
    realm: getEmptyRealmConfig(),
    mainView: {
        friends: [],
        requests: [],
        page: "online"
    },
    settings: {
        notifications: localStorage.getItem("notifications") == "true" || false,
        desktopHandling: localStorage.getItem("desktopHandling") == "true" || false
    },
    blocked: []
};
export default vars;
mglVar.vars = vars;
export function getEmptyRealmConfig() {
    return {
        users: [],
        roles: [],
        permission: 0,
        text: [],
        desc: {},
        chnlPerms: {},
        threads: []
    };
}
//# sourceMappingURL=var.js.map