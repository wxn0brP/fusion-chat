import hub from "../../hub";
hub("helpers/stateManager");

import apis from "../../api/apis";
import coreFunc from "../../core/coreFunc";
import socket from "../../core/socket/socket";
import Id from "../../types/Id";
import utils from "../../utils/utils";
import vars from "../../var/var";
import uiFunc from "./uiFunc";
import LangPkg, { langFunc } from "../../utils/translate";
import render_events from "../render/event";
import mainView from "../components/mainView";

const stateManager = {
    handle(type: string, ...data: string[]) {
        const fn = stateManagerFunc[type];
        if (!fn) return false;
        return fn(...data) || true;
    },

    async handleArray(arr: { type: string, value: any }[]) {
        for (const data of arr) {
            const val = Array.isArray(data.value) ? data.value : [data.value];
            await stateManager.handle(data.type, ...val);
            await delay(100);
        }
    },

    async handleGetParam() {
        const params = new URLSearchParams(window.location.search);
        const ctrls = [];

        for (const [key, value] of params.entries()) {
            let [prefix, numStr, type] = key.split("_");
            if (prefix != "ctrl") continue;
            if (!numStr) continue;
            if (!type) continue;

            const num = parseInt(numStr);
            if (isNaN(num)) continue;

            ctrls.push({ type, value, num });
        }

        ctrls.sort((a, b) => a.num - b.num);
        await stateManager.handleArray(ctrls);
    },

    removeControlParams() {
        const getParam = new URLSearchParams(window.location.search);

        Array.from(getParam.entries()).forEach(([key]) => {
            if (key.startsWith('ctrl_')) getParam.delete(key);
        });

        const newParams = getParam.toString();
        const newUrl = window.location.origin + window.location.pathname + (newParams ? "?" + newParams : "");
        window.history.replaceState({}, '', newUrl);
    },

    extractUrl() {
        const path = window.location.origin + window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        if (vars.chat.to.startsWith("$")) {
            params.set("ctrl_1_chat", vars.chat.to);
        } else {
            params.set("ctrl_1_cc", vars.chat.to + "_" + vars.chat.chnl);
        }

        const url = path + "?" + params.toString();
        setTimeout(() => {
            utils.writeToClipboard(url).then(ok => {
                if (ok) uiFunc.uiMsgT(LangPkg.ui.copied);
            });
        }, 2000);
    }
}

const stateManagerFunc = {
    chat(id: string) {
        if (!utils.validId(id)) return;
        coreFunc.changeChat(id as Id);
    },

    chnl(id: string) {
        if (!utils.validId(id)) return;
        coreFunc.changeChnl(id as Id);
    },

    cc(ids: string) {
        const [chat, chnl] = ids.split("_");
        if (!utils.validId(chat)) return;
        if (!utils.validId(chnl) && chnl != "main") return;
        coreFunc.changeChat(chat as Id, chnl as Id);
    },

    async call(id: string) {
        if (!utils.validId(id)) return;
        const conf = await uiFunc.confirm(langFunc(LangPkg.ui.confirm.call_to, apis.www.changeUserID(id as Id)));
        if (!conf) return;
        socket.emit("call.dm.init", id);
    },

    realmEvt() {
        render_events.show();
    },

    friendReq() {
        mainView.changeView("requests");
    },
}

export default stateManager;