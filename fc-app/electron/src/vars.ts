import { BrowserWindow } from "electron";
import { WebSocketServer } from "ws";

export interface Vars {
    mainWin: BrowserWindow | null;
    confArg: {
        link: string;
        dev: boolean;
        rpcPort: number;
        rpcAuto: boolean;
    };
    wss: WebSocketServer | null;
}

const vars: Vars = {
    mainWin: null,
    confArg: null,
    wss: null
}

export default vars;