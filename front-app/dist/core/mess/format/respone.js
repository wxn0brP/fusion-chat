import hub from "../../../hub.js";
hub("mess/format/respone");
export default function format_responeMess(mess_id, div) {
    const mess = document.querySelector(`#mess__${mess_id}`);
    if (!mess)
        return;
    const messContent = mess.querySelector(".mess_content").getAttribute("_plain");
    const resMsgDiv = document.createElement("div");
    resMsgDiv.innerHTML = messContent;
    resMsgDiv.classList.add("res_msg");
    resMsgDiv.addEventListener("click", () => {
        mess.classList.add("res_msg__animate");
        setTimeout(() => mess.classList.remove("res_msg__animate"), 3000);
    });
    div.addUp(resMsgDiv);
}
//# sourceMappingURL=respone.js.map