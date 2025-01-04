import cw from "../../core";
import hub from "../../hub";
import Id from "../../types/Id";
import createMediaPopup from "../../ui/components/media";
import { Core_mess__embed } from "../../types/core/mess";
hub("mess/format");

const formatFunc = {
    formatMess(mess_plain: string, div: HTMLDivElement) {
        let mess = formatFunc.changeText(mess_plain);
        div.innerHTML = mess;

        const elemensts = formatFunc.getElements(mess_plain);
        for (const element of elemensts) {
            div.appendChild(document.createElement("br"));
            div.appendChild(element);
        }
    },

    changeText(text: string) {
        text = text
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")

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

        text = text
            .replace(/((?:^\|.*\|$\n?)+)/gm, match => formatFunc.wrapTable(match))

            .replace(/\*\*([^\s].*?[^\s])\*\*/g, "<b>$1</b>")
            .replace(/\/\/\/([^\s].*?[^\s])\/\/\//g, "<i>$1</i>")
            .replace(/--([^\s].*?[^\s])--/g, "<strike>$1</strike>")
            .replace(/__([^\s].*?[^\s])__/g, "<u>$1</u>")

            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" onclick="magistral.messInteract.linkClick(event)">$1</a>')
            .replace(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)/g, '<a href="mailto:$1">$1</a>')

            .replace(/##([0-9A-Fa-f]{3,6})\s(.*?)\s#c/g, '<span style="color:#$1">$2</span>')
            .replace(/#([a-zA-Z]+)\s(.*?)\s#c/g, '<span style="color:$1">$2</span>')
            .replace(/#(fc)\s(.*?)\s#c/gi, '<span style="color:var(--accent)">$2</span>')

            .replace(/(?:&lt;|<)\!\s*(.*?)\s*!(?:&gt;|>)/g, '<span class="spoiler" onclick="magistral.messInteract.spoiler(event)">$1</span>')

            .replaceAll("\n", "<br />")
            .replaceAll("\\n", "<br />")
            .replace(/(?<=^|\s)---(?=\s|$)/g, "<hr />")

        text = formatList.cpu(text, 1, "rem");

        for (let i = 0; i < exclusions.length; i++) {
            const exclusion = `<pre>${exclusions[i]}</pre>`;
            const placeholder = `@EXCLUSION${i + 1}@`;
            text = text.replace(placeholder, exclusion);
        }

        return text;
    },

    wrapTable(tableText: string) {
        const rows = tableText.trim().split("\n");
        let htmlTable = `<div class="table_wrap"><table>`;

        rows.forEach((row, index) => {
            const columns = row.split("|").map(cell => cell.trim()).filter(cell => cell);

            if (index === 0) {
                htmlTable += "<thead><tr>";
                columns.forEach(column => {
                    htmlTable += `<th>${column}</th>`;
                });
                htmlTable += "</tr></thead><tbody>";
            } else {
                htmlTable += "<tr>";
                columns.forEach(column => {
                    htmlTable += `<td>${column}</td>`;
                });
                htmlTable += "</tr>";
            }
        });
        htmlTable += "</tbody></table></div>";
        return htmlTable;
    },

    responeMess(mess_id: Id, div: HTMLDivElement) {
        const mess = document.querySelector(`#mess__${mess_id}`);
        if (!mess) return;

        const messContent = mess.querySelector(".mess_content").getAttribute("_plain");

        const resMsgDiv = document.createElement("div");
        resMsgDiv.innerHTML = messContent;
        resMsgDiv.classList.add("res_msg");
        resMsgDiv.addEventListener("click", () => {
            mess.classList.add("res_msg__animate");
            setTimeout(() => mess.classList.remove("res_msg__animate"), 3000);
        });
        div.addUp(resMsgDiv);
    },

    getElements(text: string) {
        const regex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(regex);
        if (!matches) return [];
        return matches.map(link => formatFunc.mediaPreview(link)).filter(ele => !!ele);
    },

    mediaPreview(link: string) {
        if (!link) return;

        function chcek(link) {
            const xhr = new XMLHttpRequest();
            xhr.open("HEAD", link, false);
            xhr.send();
            return xhr.status == 200;
        }

        if (/\.(mp3|wav|ogg|.m4a)$/i.test(link)) {
            if (!chcek(link)) return;
            const ele = document.createElement("audio");
            ele.src = link;
            ele.controls = true;
            return ele;
        }

        if (/\.(mp4|mkv|webm|avi)$/i.test(link)) {
            if (!chcek(link)) return;
            const ele = document.createElement("video");
            ele.src = link;
            ele.controls = true;
            ele.style.maxWidth = "65%";
            ele.style.height = "auto";
            ele.style.borderRadius = "2rem";
            ele.style.cursor = "zoom-in";
            ele.onclick = () => createMediaPopup(link, { isVideo: true });
            return ele;
        }

        if (/\.(png|jpg|gif|ico|jpeg|webp|svg)$/i.test(link)) {
            if (!chcek(link)) return;
            const ele = document.createElement("img");
            ele.src = link;
            ele.style.maxWidth = "100%";
            ele.style.height = "auto";
            ele.style.cursor = "zoom-in";
            ele.onclick = () => createMediaPopup(link, { isVideo: false });
            return ele;
        }

        if (link.includes("youtube.com") || link.includes("youtu.be")) {
            function extractYouTubeVideoId(link) {
                const match = link.match(/(?:\?v=|\/embed\/|\.be\/|\/v\/|\/\d{1,2}\/|\/e\/|watch\?v=|youtu\.be\/|youtube\.com\/(?:v|e|embed)\/|youtube\.com\/user\/[^#\/]+#p\/[^#\/]+\/)([^"&?\/ ]{11})/);
                return (match && match[1]) ? match[1] : null;
            }

            const videoId = extractYouTubeVideoId(link);
            const iframe = document.createElement("iframe");
            iframe.src = `https://www.youtube.com/embed/${videoId}`;

            iframe.allowFullscreen = true;
            iframe.style.maxWidth = "100%";
            iframe.style.width = "500px";
            iframe.style.height = "300px";
            iframe.style.borderRadius = "2rem";
            return iframe;
        }

        if (link.includes("tiktok.com")) {
            const iframe = document.createElement("iframe");
            function extractTikTokVideoId(link) {
                const regex = /tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)([\w-]+)/;
                const match = link.match(regex);
                return match ? match[1] : null;
            }
            const videoId = extractTikTokVideoId(link);
            iframe.src = `https://www.tiktok.com/embed/v2/${videoId}`;
            iframe.allowFullscreen = true;

            iframe.style.maxWidth = "100%";
            iframe.style.width = "400px";
            iframe.style.height = "700px";
            iframe.style.borderRadius = "2rem";
            return iframe;
        }

        if (link.includes("reddit.com")) {
            const l = link.split("?") || [link];
            link = l[0];
            if (!link.endsWith("/")) link += "/";

            const api = JSON.parse(cw.get(`${link}.json?limit=2`));
            const post = api[0]?.data.children[0]?.data;
            const ele = document.createElement("div");

            const title = post.title;
            const author = post.author;
            ele.innerHTML = `autor: ${author}<br />tytuł: ${title}`
            return ele;
        }

        if (link.includes("spotify.com")) {
            const iframe = document.createElement("iframe");
            function extractSpotifyId(link) {
                const trackMatch = link.match(/track\/([a-zA-Z0-9]+)/);
                if (trackMatch && trackMatch[1]) {
                    return "track/" + trackMatch[1];
                }
                const playlistMatch = link.match(/playlist\/([a-zA-Z0-9]+)/);
                if (playlistMatch && playlistMatch[1]) {
                    return "playlist/" + playlistMatch[1];
                }
                return null;
            }
            const videoId = extractSpotifyId(link);
            if (!videoId) return null;
            iframe.src = `https://open.spotify.com/embed/${videoId}`;
            iframe.allowFullscreen = true;

            iframe.style.maxWidth = "100%";
            iframe.style.width = "400px";
            iframe.style.height = "84px";
            iframe.style.borderRadius = "1rem";
            return iframe;
        }
    },

    embed(embedData: Core_mess__embed, messDiv: HTMLDivElement) {
        const embedContainer = document.createElement("div");
        embedContainer.classList.add("embed");

        embedContainer.innerHTML = `
            <div style="display: flex;">
                ${embedData.image ? `<div style="width: 35%;">
                    <img src="${embedData.image}" style="width: 90%;" />
                </div>` : ""}
                <div ${embedData.image ? 'style="width: 65%;"' : ""}>
                    ${embedData.title ? `<h1>${embedData.title}</h1><br />` : ""}
                    ${embedData.description ? `<p>${embedData.description}</p><br />` : ""}
                    ${embedData.url ? `
                        <b>Link: </b>
                        <a href="${embedData.url}" onclick="magistral.messInteract.linkClick(event)">${embedData.url}</a>
                    `: ""}
                </div>
            </div>
        `

        if (embedData.customFields) {
            embedContainer.innerHTML += `<br /><hr>`;
            const customFieldsContainer = document.createElement("div");
            customFieldsContainer.classList.add("custom-fields");

            for (const [key, value] of Object.entries(embedData.customFields)) {
                const fieldContainer = document.createElement("div");
                fieldContainer.classList.add("custom-field");

                const fieldName = document.createElement("strong");
                fieldName.innerText = key + ": ";
                fieldContainer.appendChild(fieldName);

                const fieldValue = document.createElement("span");
                fieldValue.innerText = value as string;
                fieldContainer.appendChild(fieldValue);

                customFieldsContainer.appendChild(fieldContainer);
            }
            embedContainer.appendChild(customFieldsContainer);
        }

        messDiv.appendChild(embedContainer);
    }
}

const formatList = {
    calculateLevels(lines) {
        const result = [];
        let spacePerLvl = null;

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine === "") {
                result.push({ line, lvl: 0 });
                return;
            }

            const spaces = line.length - line.trimStart().length;

            if (spacePerLvl === null) {
                if (index > 0 && spaces > 0) {
                    const prevSpaces = lines[index - 1].length - lines[index - 1].trimStart().length;
                    if (spaces > prevSpaces) {
                        spacePerLvl = spaces - prevSpaces;
                    }
                }
            }

            if (spacePerLvl !== null && spaces % spacePerLvl !== 0) {
                const fixedSpaces = Math.round(spaces / spacePerLvl) * spacePerLvl;
                result.push({ line, lvl: fixedSpaces / spacePerLvl });
            } else {
                const lvl = spacePerLvl ? spaces / spacePerLvl : (spaces > 0 ? 1 : 0);
                result.push({ line, lvl });
            }
        });

        return result;
    },

    buildTree(linesWithLevels) {
        const listItemRegex = /^(?:[-*]|\d+[.)]?|[a-zA-Z][.)])\s/;
        const root = [];
        const stack = [{ children: root, lvl: -1 }];

        function getBulletType(line) {
            const trimmed = line.trim();
            if (/^[-*]\s/.test(trimmed)) return "bullet";
            if (/^\d[.)]?\s/.test(trimmed)) return "decimal";
            if (/^[a-z][.)]?\s/.test(trimmed)) return "lower-alpha";
            if (/^[A-Z][.)]?\s/.test(trimmed)) return "upper-alpha";
            return null;
        }

        linesWithLevels.forEach(({ line, lvl }) => {
            const trimmedLine = line.trim();
            const isListItem = listItemRegex.test(trimmedLine);
            const bulletType = isListItem ? getBulletType(trimmedLine) : null;

            const node = { line, children: [], bulletType };

            while (stack.length > 0 && stack[stack.length - 1].lvl >= lvl) {
                stack.pop();
            }

            stack[stack.length - 1].children.push(node);
            stack.push({ ...node, lvl });
        });

        return root;
    },

    treeToHtml(tree, marginValue, marginUnits) {
        let html = "";
        const listMapOl = ["decimal", "lower-alpha", "upper-alpha", "lower-roman", "upper-roman"];
        let listEnd = true;

        function processNode(node, lvl = 0) {
            if (node.bulletType === null) {
                html += node.line.trim() + "<br />";
                listEnd = true;
            } else {
                const listTag = listMapOl.includes(node.bulletType) ? "ol" : "ul";
                const [, ...content] = node.line.trim().split(/\s+/);
                if (listEnd) html += `<${listTag} style="list-style-type: ${node.bulletType};">`;
                html += `<li style="margin-left: ${marginValue * (lvl + 1)}${marginUnits}; list-style-type: ${node.bulletType};">${content}</li>`;

                if (node.children.length > 0) {
                    listEnd = true;
                    node.children.forEach(child => {
                        processNode(child, lvl + 1);
                    });
                    listEnd = false;
                }

                if (listEnd) html += `</${listTag}>`;
                listEnd = false;
            }
        }

        tree.forEach(node => {
            processNode(node);
        });

        return html;
    },

    cpu(text, marginValue = 0, marginUnits = "") {
        const lines = text.split(/\n|\<br\>|\<br\/\>|\<br \/>/);
        const levels = this.calculateLevels(lines);
        const tree = this.buildTree(levels);
        const html = this.treeToHtml(tree, marginValue, marginUnits);
        return html;
    }
}

export default formatFunc;