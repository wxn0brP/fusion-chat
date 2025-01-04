export default {
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
                    type: { type: "string", enum: ["text", "voice", "realm_event", "open_event"] },
                    category: { type: "string" },
                    i: { type: "number" },
                    rp: {
                        type: "array",
                        items: { type: "string", channelRP: true },
                    },
                    desc: { type: "string", minLength: 0, maxLength: 150 },
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
                    _id: { type: "string", validId: true },
                    name: { type: "string" },
                    lvl: { type: "integer", minimum: 0 },
                    p: { type: "integer", minimum: 0 },
                    c: { type: "string" }
                },
                required: ["_id", "p"],
                additionalProperties: false
            }
        },
        users: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    u: { type: "string", validIdWithPrefix: ["^", false] },
                    r: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["u", "r"],
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
        webhooks: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    whid: { type: "string", validId: true },
                    name: { type: "string" },
                    chnl: { type: "string", validId: true },
                    template: { type: "string", minLength: 1, maxLength: 500 },
                    required: { type: "array", items: { type: "string" } },
                    ajv: { type: "object", additionalProperties: true },
                    token: { type: "string" },
                    embed: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            url: { type: "string" },
                            description: { type: "string" },
                            image: { type: "string" },
                            customFields: {
                                type: "object",
                                additionalProperties: { type: "string"},
                            }
                        },
                        required: ["title"],
                        additionalProperties: false
                    }
                },
                required: ["whid", "name", "chnl", "template", "required", "ajv"],
                additionalProperties: false
            }
        }
    },
    additionalProperties: false
};
