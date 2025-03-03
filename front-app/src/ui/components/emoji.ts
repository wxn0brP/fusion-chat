import cw from "../../core";
import hub from "../../hub";
import { Ui_EmojiData, Ui_EmojiData_emoji } from "../../types/ui/components";
import { emojiHTML } from "../../var/html";
import { mglVar } from "../../var/mgl";
import vars from "../../var/var";
hub("components/emoji");

const emojiData: Ui_EmojiData = JSON.parse(cw.get("/assets/emoji.json"));

export const customEmoji: Ui_EmojiData = {
    categories: [],
    emojis: {},
}

const emojiFunc = {
    getMathEmojisName(searchEmojiName: string) {
        const categories = [...customEmoji.categories, ...emojiData.categories];
        const maths = {};

        function processEmoji(cid, emojiName) {
            if (emojiName.includes(searchEmojiName)) {
                if (!maths[cid]) maths[cid] = [];
                maths[cid].push(emojiName);
            } else {
                const emoji = emojiFunc.getEmojiFromName(emojiName);
                if (emoji.keywords.filter(k => k.includes(searchEmojiName)).length > 0) {
                    if (!maths[cid]) maths[cid] = [];
                    maths[cid].push(emojiName);
                }
            }
        }

        for (const category of categories) {
            for (const emojiName of category.emojis) {
                processEmoji(category.id, emojiName);
            }
        }

        return maths;
    },

    getEmojiFromName(emojiName: string): Ui_EmojiData_emoji | null {
        let emoji = customEmoji.emojis[emojiName];
        if (emoji) return emoji;

        emoji = emojiData.emojis[emojiName];
        return emoji ? emoji : null;
    },

    renderEmoji() {
        const input = emojiHTML.input.value;
        const maths = emojiFunc.getMathEmojisName(input);
        emojiHTML.container.innerHTML = "";
        emojiHTML.nav.innerHTML = "";

        for (const cid of Object.keys(maths)) {
            const category = maths[cid];
            if (!category) continue;

            const navButton = document.createElement("button");
            navButton.classList.add("btn");
            navButton.innerHTML = cid;
            emojiHTML.nav.appendChild(navButton);

            const catDiv = document.createElement("div");
            catDiv.innerHTML = `<h1>${cid}</h1>`;

            const catContainer = document.createElement("div");
            catContainer.classList.add("emoji__category");
            catDiv.appendChild(catContainer);

            for (const emojiName of category) {
                const emoji = emojiFunc.getEmojiFromName(emojiName);
                if (!emoji) continue;

                let emojiDiv;
                if (emoji.html) {
                    emojiDiv = document.createElement("img");
                    emojiDiv.src = `/userFiles/realms/${vars.chat.to}/emojis/${emoji.id}.png`;
                    emojiDiv.setAttribute("data-name", emoji.name);
                    emojiDiv.classList.add("emoji__img");
                } else {
                    emojiDiv = document.createElement("span");
                    emojiDiv.innerHTML = emoji.skins[0]?.native;
                }
                emojiDiv.classList.add("emoji__item");
                catContainer.appendChild(emojiDiv);

                emojiDiv.addEventListener("click", emojiFunc.emojiClick);
            }

            emojiHTML.container.appendChild(catDiv);

            navButton.addEventListener("click", () => {
                emojiHTML.container.scrollTop = catDiv.offsetTop - emojiHTML.container.offsetTop - 5;
            });
        }
    },

    emojiClick(e: MouseEvent) {
        let emoji = "";
        if (e) {
            const target = e.target as HTMLElement;
            const emojiName = target.getAttribute("data-name");
            if (emojiName) {
                const emojiData = emojiFunc.getEmojiFromName(emojiName);
                if (emojiData)
                    emoji = `:${emojiData.id}:`;
            } else {
                emoji = target.innerHTML;
            }
        }
        const event = new CustomEvent("emocji", {
            detail: emoji
        });
        emojiHTML.div.dispatchEvent(event);
    }
}

emojiHTML.input.addEventListener("input", emojiFunc.renderEmoji);
emojiFunc.renderEmoji();

export default emojiFunc;
mglVar.emojiFunc = emojiFunc;
mglVar.customEmoji = customEmoji;