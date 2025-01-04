import hub from "../hub";
import Vars from "../types/var";
import { mglVar } from "./html";
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
        pinned: []
    },
    temp: {
        socrollBlock: false,
        replyId: null,
        editId: null,
    }, // temporary
    messCount: 40,
    baseTitle: `Fusion Chat`,
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
    realm: {
        users: [],
        roles: [],
        permission: 0,
        text: [],
        desc: {},
        chnlPerms: {},
        threads: [] 
    },
    mainView: {
        friends: [],
        requests: [],
        page: "online"
    },
    uploadImgTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
    settings: {
        notifications: localStorage.getItem("notifications") == "true" || false,
        desktopHandling: localStorage.getItem("desktopHandling") == "true" || false
    }
}

export default vars;
mglVar.vars = vars;