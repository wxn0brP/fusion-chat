module.exports = {
    type: "object",
    properties: {
        meta: {
            type: "object",
            properties: {
                name: { type: "string" },
                owner: { type: "string" },
                img: { type: "boolean" }
            },
            required: ["name", "owner"],
            additionalProperties: false
        },
        categories: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    cid: { type: "string", validId: true },
                    name: { type: "string" },
                    i: { type: "number" }
                },
                required: ["cid", "name", "i"],
                additionalProperties: false
            }
        },
        channels: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    chid: { type: "string", validId: true },
                    name: { type: "string" },
                    type: { type: "string", enum: ["text", "voice"] },
                    category: { type: "string" },
                    i: { type: "number" },
                    rp: {
                        type: "array",
                        items: { type: "string", channelRP: true },
                    }
                },
                required: ["chid", "name", "type", "category", "i", "rp"],
                additionalProperties: false
            }
        },
        roles: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    rid: { type: "string", validId: true },
                    name: { type: "string" },
                    parent: { type: "string" },
                    p: {
                        anyOf: [
                            { type: "string", enum: ["all"] },
                            { type: "array", items: { type: "string", enum: ["text", "voice", "manage text", "manage server"] } }
                        ]
                    },
                    color: { type: "string" }
                },
                required: ["rid", "name", "parent", "p"],
                additionalProperties: false
            }
        },
        users: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    uid: { type: "string", validId: true },
                    roles: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["uid", "roles"],
                additionalProperties: false
            }
        },
        banUsers: {
            type: "array",
            items: {
                type: "string"
            }
        },
        emojis: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string", minLength: 1, maxLength: 64 },
                    unicode: { type: "number" }
                },
                required: ["name", "unicode"],
                additionalProperties: false
            }
        },
    },
    required: ["meta", "categories", "channels", "roles", "users", "emojis"],
    additionalProperties: false
};
