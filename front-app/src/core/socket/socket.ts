import hub from "../../hub";
import { mglVar } from "../../var/mgl";
import { GLC } from "@wxn0brp/gloves-link-client/index";
hub("socket");

const socket = new GLC("/", {
    token: localStorage.getItem("token"),
    reConnect: true,
    reConnectInterval: 1000,
    autoConnect: false,
});

export default socket;
mglVar.socket = socket;