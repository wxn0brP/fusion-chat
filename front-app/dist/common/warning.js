import hub from "../hub.js";
hub("warning");
import debugFunc from "../core/debug.js";
import LangPkg from "../utils/translate.js";
(function () {
    if (debugFunc.isDebug)
        return;
    const lang = LangPkg.common.console_warning;
    const csss = [
        "60px;color:gold",
        "20px",
        "20px;color:red",
        "20px",
    ];
    csss.forEach((css, i) => {
        console.log(`%c${lang["w" + (i + 1)]}`, `font-size:${css}`);
    });
})();
//# sourceMappingURL=warning.js.map