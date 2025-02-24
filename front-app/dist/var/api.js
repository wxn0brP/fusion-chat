import hub from "../hub.js";
import { mglVar } from "./mgl.js";
hub("var/api");
const apiVars = {
    temp: {
        user: {
            main: {},
        },
        realm: {},
    },
    user_state: {},
    lastMess: {},
};
export default apiVars;
mglVar.apiVars = apiVars;
//# sourceMappingURL=api.js.map