export default {
    type: "object",
    properties: {
        from: {
            type: "string",
            validId: true
        },
        mentions: {
            type: "string",
            validId: true
        },
        before: {
            oneOf: [
                { type: "string", format: "date-time" },
                { type: "string", format: "date" }
            ]
        },
        during: { 
            type: "string",
            format: "date"
        },
        after: {
            oneOf: [
                { type: "string", format: "date-time" },
                { type: "string", format: "date" }
            ]
        },
        pinned: {
            type: "boolean"
        },
        message: {
            type: "string",
            minLength: 1,
            maxLength: 500
        }
    },
    additionalProperties: false
};