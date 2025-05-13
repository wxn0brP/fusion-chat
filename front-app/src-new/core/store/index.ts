import globalExpose from "#bus";
import { Id } from "#types/base";
import { Core_socket__blocked, Core_socket__dm, Core_socket__user_status_type } from "#types/core/socket";
import { Vars_mainView__friend, Vars_mainView__page, Vars_realm__chnlPerm, Vars_realm__role, Vars_realm__thread, Vars_realm__user, Vars_realms } from "#types/var";
import { createStore } from "./store";

const initData = {
    user: {
        _id: localStorage.getItem("user_id"),
        fr: localStorage.getItem("from"),
        status: "online" as Core_socket__user_status_type,
        statusText: "",
    },

    chat: {
        id: "main",
        chnl: "main",
        loadedMessages: 0,
    },

    ui: {
        mainView: {
            view: "all" as Vars_mainView__page,
            open: false,
        },
        bar: {
            open: false,
        },
        navs: {
            mainOpen: true,
            realmUserOpen: false
        },
        messages: {
            open: false,
            selectedMess: "" as Id
        },
    },

    realms: [] as Vars_realms[],
    friends: [] as Vars_mainView__friend[],
    friendRequest: [],
    dm: [] as Core_socket__dm[],
    blocked: [] as Core_socket__blocked[],

    realm: {
        p: 0,
        chnlPerm: null as { [id: Id]: Vars_realm__chnlPerm },
        descriptions: null as { [id: Id]: string },
        threads: null as Vars_realm__thread[],
        users: null as Vars_realm__user[],
        roles: null as Vars_realm__role[],
    }
}


export const $store = createStore(initData);
globalExpose("vars", "store", $store);