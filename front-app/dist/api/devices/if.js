import uiFunc from "../../ui/helpers/uiFunc.js";
export const send = (data) => {
    uiFunc.uiMsg(data);
};
setTimeout(() => {
    uiFunc.uiMsg("Warning: Fusion Chat is being loaded within an external source. Proceed with caution.");
}, 5_500);
//# sourceMappingURL=if.js.map