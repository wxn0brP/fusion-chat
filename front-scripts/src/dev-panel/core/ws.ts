import type SocketIOClient from "socket.io-client";
import listBot from "./page_listBot";
declare var io: typeof SocketIOClient;

const socket = io("/dev-panel", {
    transports: ["websocket"],
    auth: {
        token: localStorage.getItem("token")
    },
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
});

socket.on("connect", () => {
    lo("connected to socket");
    listBot.getBots();
});

socket.on("error", console.log);
socket.on("error.valid", console.log);

socket.on("connect_error", (data) => {
    if(!localStorage.getItem("token")) window.location.href = "/login?err=true&next=/dev-panel";

    lo(data);
    const dataStr = data.toString();
    if(dataStr.includes("Error: Authentication error")){
        window.location.href = "/login?err=true&next=/dev-panel";
    }else
    if(dataStr.includes("Ban:")){
        const timeMath = dataStr.match(/Ban: You are temporarily banned. Please try again after (\d+) minutes./);
        let text = "";
        let param = "";
        if(timeMath){
            text = "You are temporarily banned. Please try again after $ minutes.";
            param = timeMath[1];
        }else{
            text = dataStr;
            param = "";
        }

        lo(text, param);
        return;
    }
});

export default socket;