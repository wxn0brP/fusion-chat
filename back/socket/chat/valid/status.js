export default {
    type: "object",
    properties: {
        state: { type: "string", minLength: 1, maxLength: 256 },
        name: { type: "string", minLength: 1, maxLength: 256 },

        details: { type: "string", minLength: 1, maxLength: 256 },
        logoName: { type: "string", minLength: 1, maxLength: 256 },
        logoText: { type: "string", minLength: 1, maxLength: 256 },
        startTime: { type: "number", minimum: 0 },
        endTime: { type: "number", minimum: 0 },
        party: {
            type: "object",
            properties: {
                id: { type: "string", minLength: 1, maxLength: 256 },
                state: { type: "number", minimum: 0 },
                max: { type: "number", minimum: 0 },
            },
            required: ["id", "state"],
        },
    },
    required: ["state", "name"],
    additionalProperties: false
}