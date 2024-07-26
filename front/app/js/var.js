const vars = {
    user: {
        _id: localStorage.getItem("user_id"),
        fr: localStorage.getItem("from"),
    },
    chat: {
        to: "main",
        chnl: "main",
        actMess: 0
    },
    temp: {}, // temporary
    messCount: 40,
    baseTitle: `Fusion Chat`,
    apisTemp: {
        user: {},
        chat: {},
    },
    lastMess: {},
    privs: [],
    servers: {
        users: [],
        roles: []
    }
}