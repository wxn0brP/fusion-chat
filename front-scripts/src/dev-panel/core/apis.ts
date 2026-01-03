import { GetInServer__Response } from "../types/api";
import Id from "../types/Id";
import uiFunc from "../utils/uiFunc";

const apiVars = {
    temp: {
        realm: {}
    }
}

const apis = {
    www: {
        async changeChat(id: Id): Promise<string> {
            if (apiVars.temp.realm[id]) return apiVars.temp.realm[id];
            const data = (await apis.www.getInServer("/api/id/chat?chat=" + id)).name;
            apiVars.temp.realm[id] = data;
            return data;
        },

        async getInServer<T = GetInServer__Response>(url: string): Promise<T> {
            const data = await fetch(url).then(res => res.json());
            if (data.err) {
                uiFunc.uiMsg("Error fetching data.");
                return null;
            }
            return data;
        }
    }
}

export default apis;