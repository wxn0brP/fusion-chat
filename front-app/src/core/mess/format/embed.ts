import hub from "../../../hub";
import { Core_mess__embed } from "../../../types/core/mess";
hub("mess/format/embed");

export function format_embed(embedData: Core_mess__embed, messDiv: HTMLDivElement) {
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
                    <a href="${embedData.url}" onclick="mglInt.mess.linkClick(event)">${embedData.url}</a>
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