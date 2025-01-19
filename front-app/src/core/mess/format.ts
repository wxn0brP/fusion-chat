import hub from "../../hub";
import format_media from "./format/media";
import format_text from "./format/text";
hub("mess/format");

const formatFunc = {
    formatMess(mess_plain: string, div: HTMLDivElement) {
        let mess = format_text(mess_plain);
        div.innerHTML = mess;

        const elements = formatFunc.getElements(mess_plain);
        for (const element of elements) {
            div.appendChild(document.createElement("br"));
            div.appendChild(element);
        }
    },

    getElements(text: string) {
        const regex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(regex);
        if (!matches) return [];
        return matches.map(link => format_media(link)).filter(ele => !!ele);
    },
}

export default formatFunc;