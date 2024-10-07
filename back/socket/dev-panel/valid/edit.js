import botPerm from "./botPerm.js";

export default {
    type: "object",
    properties: {
        info: {
            type: "object",
            properties: {
                name: { type: "string", minLength: 1, maxLength: 64 },
            },
            required: ["name"],
            additionalProperties: false
        },
        data: {
            type: "object",
            properties: {
                perm: {
                    type: "array",
                    items: {
                        type: "string",
                        enum: botPerm
                    }
                }
            },
            required: ["perm"],
        }
    },
    required: ["info", "data"],
    additionalProperties: false
}  