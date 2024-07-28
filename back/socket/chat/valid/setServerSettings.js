module.exports = {
    type: "object",
    properties: {
        meta: {
            type: "object",
            properties: {
                name: { type: "string" },
                owner: { type: "string" },
                _id: { type: "string" }
            },
            required: ["name", "owner", "_id"]
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
                required: ["cid", "name", "i"]
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
                    i: { type: "number" }
                },
                required: ["chid", "name", "type", "category", "i"]
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
                            { type: "string" },
                            { type: "array", items: { type: "string" } }
                        ]
                    },
                    color: { type: "string" }
                },
                required: ["rid", "name", "parent", "p"]
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
                required: ["uid", "roles"]
            }
        }
    },
    required: ["meta", "categories", "channels", "roles", "users"]
};
