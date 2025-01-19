import hub from "../hub";
import Vars, { Vars_realm } from "../types/var";
import { mglVar } from "./mgl";
hub("var");

const vars: Vars = {
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
    }, // temporary
    apisTemp: {
        user: {
            main: {},
        },
        chat: {},
        user_status: {},
    },
    lastMess: {},
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
}

export default vars;
mglVar.vars = vars;

export function getEmptyRealmConfig(): Vars_realm {
    return {
        users: [],
        roles: [],
        permission: 0,
        text: [],
        desc: {},
        chnlPerms: {},
        threads: []
    }
}