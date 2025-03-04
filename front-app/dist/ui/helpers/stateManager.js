import hub from "../../hub.js";
hub("helpers/stateManager");
import apis from "../../api/apis.js";
import coreFunc from "../../core/coreFunc.js";
import socket from "../../core/socket/socket.js";
import utils from "../../utils/utils.js";
import vars from "../../var/var.js";
import uiFunc from "./uiFunc.js";
import LangPkg, { langFunc } from "../../utils/translate.js";
import render_events from "../render/event.js";
import mainView from "../components/mainView.js";
const stateManager = {
    handle(type, ...data) {
        const fn = stateManagerFunc[type];
        if (!fn)
            return false;
        return fn(...data) || true;
    },
    async handleArray(arr) {
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
            if (prefix != "ctrl")
                continue;
            if (!numStr)
                continue;
            if (!type)
                continue;
            const num = parseInt(numStr);
            if (isNaN(num))
                continue;
            ctrls.push({ type, value, num });
        }
        ctrls.sort((a, b) => a.num - b.num);
        await stateManager.handleArray(ctrls);
    },
    removeControlParams() {
        const getParam = new URLSearchParams(window.location.search);
        Array.from(getParam.entries()).forEach(([key]) => {
            if (key.startsWith('ctrl_'))
                getParam.delete(key);
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
        }
        else {
            params.set("ctrl_1_cc", vars.chat.to + "_" + vars.chat.chnl);
        }
        const url = path + "?" + params.toString();
        setTimeout(() => {
            utils.writeToClipboard(url).then(ok => {
                if (ok)
                    uiFunc.uiMsgT(LangPkg.ui.copied);
            });
        }, 2000);
    }
};
const stateManagerFunc = {
    chat(id) {
        if (!utils.validId(id))
            return;
        coreFunc.changeChat(id);
    },
    chnl(id) {
        if (!utils.validId(id))
            return;
        coreFunc.changeChnl(id);
    },
    cc(ids) {
        const [chat, chnl] = ids.split("_");
        if (!utils.validId(chat))
            return;
        if (!utils.validId(chnl) && chnl != "main")
            return;
        coreFunc.changeChat(chat, chnl);
    },
    async call(id) {
        if (!utils.validId(id))
            return;
        const conf = await uiFunc.confirm(langFunc(LangPkg.ui.confirm.call_to, apis.www.changeUserID(id)));
        if (!conf)
            return;
        socket.emit("call.dm.init", id);
    },
    realmEvt() {
        render_events.show();
    },
    friendReq() {
        mainView.changeView("requests");
    },
};
export default stateManager;
//# sourceMappingURL=stateManager.js.map