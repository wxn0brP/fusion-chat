import { mglVar } from "#var/mgl";
import { GLC } from "@wxn0brp/gloves-link-client/index";

export const socket = new GLC("/", {
    token: localStorage.getItem("token"),
    reConnect: true,
    reConnectInterval: 1000,
    autoConnect: false,
});

mglVar.socket = socket;