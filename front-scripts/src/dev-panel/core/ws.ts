import { GLC } from "@wxn0brp/gloves-link-client";
import mainListBots from "./mainList";

const socket = new GLC("/dev-panel", {
    token: localStorage.getItem("token"),
    autoConnect: false
});

socket.on("connect", () => {
    lo("connected to socket");
    mainListBots.getBots();
});

socket.on("error", console.log);
socket.on("error.valid", console.log);

socket.on("connect_error", (data) => {
    if (!localStorage.getItem("token")) window.location.href = "/login?err=true&next=/dev-panel";

    lo(data);
    const dataStr = data.toString();
    if (dataStr.includes("Error: Authentication error")) {
        window.location.href = "/login?err=true&next=/dev-panel";
    } else
        if (dataStr.includes("Ban:")) {
            const timeMath = dataStr.match(/Ban: You are temporarily banned. Please try again after (\d+) minutes./);
            let text = "";
            let param = "";
            if (timeMath) {
                text = "You are temporarily banned. Please try again after $ minutes.";
                param = timeMath[1];
            } else {
                text = dataStr;
                param = "";
            }

            lo(text, param);
            return;
        }
});

export default socket;