module.exports = {
    type: "object",
    properties: {
        meta: {
            type: "object",
            properties: {
                name: { type: "string" },
                owner: { type: "string" },
                _id: { type: "string" },
            },
            required: ["name", "owner", "_id"],
            additionalProperties: false
        },
        categories: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    cid: { type: "string" },
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
                    chid: { type: "string" },
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
                    rid: { type: "string" },
                    name: { type: "string" },
                    parent: { type: "string" },
                    p: {
                        anyOf: [
                            { type: "string", enum: ["all"] },
                            { type: "array", items: { type: "string", enum: ["text", "voice", "menage text", "menage server"] } }
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
                    uid: { type: "string" },
                    roles: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["uid", "roles"],
                additionalProperties: false
            }
        }
    },
    required: ["meta", "categories", "channels", "roles", "users"],
    additionalProperties: false
};
