import axios from "axios";
import vars from "../vars";

async function updateApp(appVersion: string) {
    const serverVersion = await getServerVersion();

    const res = versionEngine(appVersion, serverVersion);
    return res < 0;
}

function versionEngine(versionA: string, versionB: string) {
    const verA = versionA.split(".");
    const verB = versionB.split(".");

    if (verA.length === 0 || verB.length === 0) return 0;
    if (verA == verB) return 0;

    if (verA.length !== verB.length) {
        if (verA.length < verB.length) {
            const il = verB.length - verA.length;
            for (let i = 0; i < il; i++) verA.push("0");
        } else {
            const il = verA.length - verB.length;
            for (let i = 0; i < il; i++) verB.push("0");
        }
    }

    for (let i = 0; i < verA.length; i++) {
        const a = parseInt(verA[i]);
        const b = parseInt(verB[i]);
        if (a < b) return -1;
        if (a > b) return 1;
    }

    return 0;
}

async function getServerVersion(): Promise<string> {
    try {
        const req = await axios.get(vars.confArg.link + "/meta/ele-version");
        return req.data;
    } catch {
        return "0.0.1";
    }
}

export default updateApp;