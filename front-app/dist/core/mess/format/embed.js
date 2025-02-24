import hub from "../../../hub.js";
hub("mess/format/embed");
export function format_embed(embedData, messDiv) {
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
                ` : ""}
            </div>
        </div>
    `;
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
            fieldValue.innerText = value;
            fieldContainer.appendChild(fieldValue);
            customFieldsContainer.appendChild(fieldContainer);
        }
        embedContainer.appendChild(customFieldsContainer);
    }
    messDiv.appendChild(embedContainer);
}
//# sourceMappingURL=embed.js.map