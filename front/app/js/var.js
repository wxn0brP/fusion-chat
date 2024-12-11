const vars = {
    user: {
        _id: localStorage.getItem("user_id"),
        fr: localStorage.getItem("from"),
    },
    chat: {
        to: "main",
        chnl: "main",
        actMess: 0,
        pinned: []
    },
    temp: {}, // temporary
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