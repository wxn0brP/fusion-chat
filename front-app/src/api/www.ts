import debugFunc, { LogLevel } from "#core/debug";
import { Core_Api__GetInServer__Response } from "#types/core/api";
import Id from "#types/Id";
import { uiFunc } from "#ui/helpers/uiFunc";
import changeCodeToString from "#utils/code";
import LangPkg from "#utils/translate";
import apiVars from "#var/api";
import vars from "#var/var";

async function changeIdUtil(
    endpoint: string,
    idPrefix: string,
    id: Id,
    opts: Record<string, string> = null,
    nameSuffix: string = ""
): Promise<string> {
    const url = new URL("/api/id/" + endpoint);
    url.searchParams.set("id", id.replace(idPrefix, ""));
    if (opts) {
        for (const [key, value] of Object.entries(opts)) {
            url.searchParams.set(key, value);
        }
    }
    const data = await getInServer(url.toString());

    let name = data ? data.name + nameSuffix : "Unknown";
    apiVars.temp.user.main[id] = name;

    return name;
}

export async function changeUserID(id: Id): Promise<string> {
    const chat = vars.chat.to;
    const temp = apiVars.temp.user;

    if (chat.startsWith("$") || chat == "main") { // if dm or main
        if (temp.main[id]) return temp.main[id];
        const data = (await getInServer("/api/id/u?id=" + id)).name;
        if (!data) return "Unknown";
        temp.main[id] = data;
        return data;
    }

    // if realm
    if (!temp[chat]) temp[chat] = {};

    const issetData = temp[chat][id];
    if (issetData) return issetData;
    if (issetData == 0) return temp.main[id];

    if (id.startsWith("%")) { // if webhook
        return await changeIdUtil("wh", "%", id, { chat }, " (APP)");
    } else if (id.startsWith("^")) { // if bot
        return await changeIdUtil("bot", "^", id, { chat }, " (BOT)");
    } else if (id.startsWith("(")) { // if event chnl
        return await changeIdUtil("event", "(", id, { chat }, " (EVENT)");
    }
    else { // if user in chat
        interface Data extends Core_Api__GetInServer__Response {
            c: -1 | 0 | 1
        }

        const data = await getInServer<Data>("/api/id/u?id=" + id + "&chat=" + chat);
        if (!data) return "Unknown";
        if (data.c == 1) {
            temp[chat][id] = data.name;
            return data.name;
        }
        else if (data.c == 0) {
            temp[chat][id] = 0;
            if (temp.main[id]) return temp.main[id];
            const data = await getInServer<Data>("/api/id/u?id=" + id);
            if (!data?.name) return "Unknown";

            const name = data.name;
            temp.main[id] = name;
            return name;
        } else {
            temp.main[id] = data.name;
            return data.name;
        }
    }
}

export async function changeChat(id: Id): Promise<string> {
    if (apiVars.temp.realm[id]) return apiVars.temp.realm[id];

    const data = await getInServer("/api/id/chat?chat=" + id);
    const name = data ? data.name : "Unknown";

    apiVars.temp.realm[id] = name;
    return name;
}

export async function getInServer<T = Core_Api__GetInServer__Response>(url: string): Promise<T> {
    const data = await fetch(url).then(res => res.json());
    if (data.err) {
        uiFunc.uiMsgT(LangPkg.api.error_fetch, ["."]);
        uiFunc.uiMsgT(LangPkg.api.error, changeCodeToString(data.c));
        debugFunc.msg(LogLevel.ERROR, data);
        return null;
    }

    return data;
}