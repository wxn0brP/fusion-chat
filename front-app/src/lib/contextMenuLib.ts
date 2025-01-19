import hub from "../hub";
hub("contextMenuLib");

const contextMenuLib = {
    menuShower(ele: HTMLElement, e: MouseEvent) {
        ele.style.display = "block";
        _handleClick(e);

        function _handleClick(e: MouseEvent) {
            window.getSelection().removeAllRanges();
            contextMenuLib.menuMax(e, ele);
            document.body.addEventListener("click", _click);
        }

        function _click() {
            _removeClick();
            ele.style.display = "none";
        }

        function _removeClick() {
            document.body.removeEventListener("click", _click);
        }
    },

    menuMax(e: MouseEvent, doc: HTMLElement) {
        const x = e.clientX;
        const y = e.clientY;
        const w = doc.clientWidth;
        const h = doc.clientHeight;

        doc.style.left = (x + 10) + "px";
        doc.style.top = (y + 10) + "px";
        doc.style.right = "auto";
        doc.style.bottom = "auto";

        if (x < 0) doc.style.left = "10px";
        if (y < 0) doc.style.top = "10px";

        const width = window.innerWidth;
        const height = window.innerHeight;
        if (x + w > width) {
            doc.style.left = "auto";
            doc.style.right = "10px";
        }
        if (y + h > height) {
            doc.style.top = "auto";
            doc.style.bottom = "10px";
        }
    }
}

export default contextMenuLib;