import modalView from "#components/app/modal.view";
import globalExpose from "#core/bus";
import uiFunc from "#helpers/uiFunc";
import LangPkg from "#utils/translate";

modalView.register("openLink", () => (root: HTMLDivElement, url: string) => {
    if (!url) return;
    if (!/^(https?:\/\/)/i.test(url)) url = "http://" + url;

    const urlParts = url.split("/");
    if (urlParts.length < 2) return uiFunc.uiMsgT(LangPkg.ui.message.invalid_link);
    const urlColored =
        `${urlParts[0]}//<span style="color: red">${urlParts[2]}</span>/${urlParts.slice(3).join("/")}`;

    root.innerHTML = `
        <h1>${LangPkg.ui.open_link}?</h1>
        <br />
        <h2>${urlColored}</h2>
        <br />
        <div id="linkClick_btns">
            <button id="linkClick_yes" class="btn">${LangPkg.uni.yes}</button>
            <button id="linkClick_no" class="btn">${LangPkg.uni.cancel}</button>
        </div>
    `;

    function handleYesClick() {
        window.open(url, "_blank");
        modalView.close();
    }
    root.querySelector("#linkClick_yes").addEventListener("click", handleYesClick);
    root.querySelector("#linkClick_no").addEventListener("click", () => modalView.close());
});

globalExpose("ui", "linkClick", (event: MouseEvent) => {
    event.preventDefault();
    const url = (event.target as HTMLElement).getAttribute("href");
    if (!url) return;
    modalView.show("openLink", url);
});