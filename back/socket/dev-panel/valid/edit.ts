export const infoSchema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 64 },
    },
    required: ["name"],
    additionalProperties: false
}