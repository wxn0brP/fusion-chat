import { API_botMeta } from "../types/api";
import Id from "../types/Id";

interface Vars {
    user: {
        _id: string;
        fr: string;
    };
    bots: API_botMeta[];
    actualBot: API_botMeta;
    botData: {
        realms: Id[];
    };
}

const vars: Vars = {
    user: {
        _id: localStorage.getItem("user_id"),
        fr: localStorage.getItem("from"),
    },
    bots: [],
    actualBot: null,
    botData: {
        realms: []
    }
}

export default vars;