import hub from "../../../hub.js";
import vars from "../../../var/var.js";
import format_list from "./list.js";
import format_wrapTable from "./table.js";
hub("mess/format/text");
export default function format_text(text) {
    text = text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const excludePattern = /\`\`\`(.*?)\`\`\`/gs;
    const excludeMatches = text.match(excludePattern);
    const exclusions = [];
    if (excludeMatches) {
        for (const match of excludeMatches) {
            const exclusion = match.slice(3, -3);
            exclusions.push(exclusion);
            const placeholder = `@EXCLUSION${exclusions.length}@`;
            text = text.replace(match, placeholder);
        }
    }
    text = text.replace(/((?:^\|.*\|$\n?)+)/gm, match => format_wrapTable(match));
    text = markCpu(text, "**", "b");
    text = markCpu(text, "//", "i");
    text = markCpu(text, "--", "strike");
    text = markCpu(text, "__", "u");
    text = text
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" onclick="mglInt.mess.linkClick(event)">$1</a>')
        .replace(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)/g, '<a href="mailto:$1">$1</a>')
        .replace(/##([0-9A-Fa-f]{3,6})\s(.*?)\s#c/g, '<span style="color:#$1">$2</span>')
        .replace(/#([a-zA-Z]+)\s(.*?)\s#c/g, '<span style="color:$1">$2</span>')
        .replace(/#(fc)\s(.*?)\s#c/gi, '<span style="color:var(--accent)">$2</span>')
        .replace(/(?:&lt;|<)\!\s*(.*?)\s*!(?:&gt;|>)/g, '<span class="spoiler" onclick="mglInt.mess.spoiler(event)">$1</span>')
        .replaceAll("\n", "<br />")
        .replaceAll("\\n", "<br />")
        .replace(/(?<=^|\s)---(?=\s|$)/g, "<hr />");
    text = format_list.cpu(text, 1, "rem");
    for (let i = 0; i < exclusions.length; i++) {
        const exclusion = `<pre>${exclusions[i]}</pre>`;
        const placeholder = `@EXCLUSION${i + 1}@`;
        text = text.replace(placeholder, exclusion);
    }
    text = text.replace(/:([a-z0-9]+-[a-z0-9]+-[a-z0-9]+):/g, (match, emojiId) => {
        return `<img src="/userFiles/realms/${vars.chat.to}/emojis/${emojiId}.png" class="message_emoji" alt=":${emojiId}:">`;
    });
    return text;
}
function markCpu(text, marker, htmlTag) {
    let result = '';
    let isInsideMarker = false;
    let tempBuffer = '';
    for (let i = 0; i < text.length; i++) {
        if (text.slice(i, i + marker.length) === marker) {
            if (isInsideMarker) {
                if (tempBuffer.trim() === '' || tempBuffer.startsWith(' ') || tempBuffer.endsWith(' ')) {
                    result += marker + tempBuffer + marker;
                }
                else {
                    result += `<${htmlTag}>${tempBuffer}</${htmlTag}>`;
                }
                tempBuffer = '';
                isInsideMarker = false;
            }
            else {
                if (tempBuffer === '') {
                    isInsideMarker = true;
                }
                else {
                    result += tempBuffer;
                }
                tempBuffer = '';
            }
            i += marker.length - 1;
        }
        else {
            if (isInsideMarker) {
                tempBuffer += text[i];
            }
            else {
                result += text[i];
            }
        }
    }
    if (isInsideMarker) {
        result += marker + tempBuffer;
    }
    return result;
}
//# sourceMappingURL=text.js.map