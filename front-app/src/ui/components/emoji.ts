import { Ui_EmojiData, Ui_EmojiData_emoji } from "#types/ui/components";
import { emojiHTML } from "#var/html";
import { mglVar } from "#var/mgl";
import { vars } from "#var/var";

const emojiData: Ui_EmojiData = await fetch("/assets/emoji.json").then(res => res.json());

export const customEmoji: Ui_EmojiData = {
    categories: [],
    emojis: {},
}

export namespace uic_emoji {
    export function getMathEmojisName(searchEmojiName: string) {
        const categories = [...customEmoji.categories, ...emojiData.categories];
        const maths = {};

        function processEmoji(cid, emojiName) {
            if (emojiName.includes(searchEmojiName)) {
                if (!maths[cid]) maths[cid] = [];
                maths[cid].push(emojiName);
            } else {
                const emoji = this.getEmojiFromName(emojiName);
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
    }

    export function getEmojiFromName(emojiName: string): Ui_EmojiData_emoji | null {
        let emoji = customEmoji.emojis[emojiName];
        if (emoji) return emoji;

        emoji = emojiData.emojis[emojiName];
        return emoji ? emoji : null;
    }

    export function renderEmoji() {
        const input = emojiHTML.input.value;
        const maths = this.getMathEmojisName(input);
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
                const emoji = this.getEmojiFromName(emojiName);
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

                emojiDiv.addEventListener("click", this.emojiClick);
            }

            emojiHTML.container.appendChild(catDiv);

            navButton.addEventListener("click", () => {
                emojiHTML.container.scrollTop = catDiv.offsetTop - emojiHTML.container.offsetTop - 5;
            });
        }
    }

    export function emojiClick(e: MouseEvent) {
        let emoji = "";
        if (e) {
            const target = e.target as HTMLElement;
            const emojiName = target.getAttribute("data-name");
            if (emojiName) {
                const emojiData = this.getEmojiFromName(emojiName);
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

emojiHTML.input.addEventListener("input", uic_emoji.renderEmoji);
uic_emoji.renderEmoji();

mglVar.emojiFunc = uic_emoji;
mglVar.customEmoji = customEmoji;