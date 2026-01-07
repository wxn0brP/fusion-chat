
import ApisVars from "../types/apisVars";
import { mglVar } from "./mgl"; const apiVars: ApisVars = {
    temp: {
        user: {
            main: {},
        },
        realm: {},
    },
    user_state: {},
    lastMess: {},
}

export default apiVars;
mglVar.apiVars = apiVars;