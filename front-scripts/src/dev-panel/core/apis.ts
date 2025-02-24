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
        changeChat(id: Id): string {
            if (apiVars.temp.realm[id]) return apiVars.temp.realm[id];
            const data = apis.www.getInServer("/api/id/chat?chat=" + id).name;
            apiVars.temp.realm[id] = data;
            return data;
        },

        getInServer<T = GetInServer__Response>(url: string): T {
            const dataS = cw.get(url);
            const data = JSON.parse(dataS);
            if (data.err) {
                uiFunc.uiMsg("Error fetching data.");
                return null;
            }
            return data;
        }
    }
}

export default apis;