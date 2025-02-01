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

        if(isEmojiMessage(mess_plain, div)) {
            div.classList.add("mess__text__emoji");
        }
    },

    getElements(text: string) {
        const regex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(regex);
        if (!matches) return [];
        return matches.map(link => format_media(link)).filter(ele => !!ele);
    },
}

function isEmojiMessage(mess_plain: string, div: HTMLDivElement) {
    const isNativeEmoji = /^[\p{Extended_Pictographic}]+$/u.test(mess_plain);
    const isCustomEmoji = /^(:[a-z0-9]+-[a-z0-9]+-[a-z0-9]+:)+$/g.test(mess_plain);

    if(isCustomEmoji){
        div.querySelectorAll("img").forEach(img => {
            function notLoaded() {
                img.removeEventListener("error", notLoaded);
                div.clR("mess__text__emoji");
            }
            img.addEventListener("error", notLoaded);
        });
    }

    return isNativeEmoji || isCustomEmoji;
}

export default formatFunc;