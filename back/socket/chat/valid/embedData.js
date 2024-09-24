export default {
    type: "object",
    properties: {
        title: { type: "string" },
        url: { type: "string" },
        description: { type: "string" },
        image: { type: "string" },
        customFields: { type: "object" }
    },
    required: ["title"],
    additionalProperties: false
}