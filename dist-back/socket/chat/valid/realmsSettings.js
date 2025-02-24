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
                    type: {
                        type: "string",
                        enum: [
                            "text", "voice", "announcement", "open_announcement", "forum",
                        ]
                    },
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
                    emoji: { type: "string", validId: true },
                },
                required: ["name", "emoji"],
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
                    template: { type: "string", maxLength: 500 },
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
                                additionalProperties: { type: "string" },
                            }
                        },
                        additionalProperties: false
                    }
                },
                required: ["whid", "name", "chnl", "required", "ajv"],
                allOf: [
                    {
                        if: {
                            not: { required: ["embed"] }
                        },
                        then: {
                            properties: {
                                template: {
                                    type: "string",
                                    minLength: 1,
                                    pattern: ".*\\S.*"
                                }
                            },
                            required: ["template"]
                        }
                    },
                    {
                        if: {
                            required: ["embed"]
                        },
                        then: {
                            required: ["template"]
                        }
                    }
                ],
                additionalProperties: false
            }
        }
    },
    additionalProperties: false
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbG1zU2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9iYWNrL3NvY2tldC9jaGF0L3ZhbGlkL3JlYWxtc1NldHRpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGVBQWU7SUFDWCxJQUFJLEVBQUUsUUFBUTtJQUNkLFVBQVUsRUFBRTtRQUNSLElBQUksRUFBRTtZQUNGLElBQUksRUFBRSxRQUFRO1lBQ2QsVUFBVSxFQUFFO2dCQUNSLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7Z0JBQ3hCLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7Z0JBQ3pCLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7YUFDM0I7WUFDRCxRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO1lBQzNCLG9CQUFvQixFQUFFLEtBQUs7U0FDOUI7UUFDRCxVQUFVLEVBQUU7WUFDUixJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxVQUFVLEVBQUU7b0JBQ1IsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO29CQUN0QyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO29CQUN4QixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO2lCQUN4QjtnQkFDRCxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQztnQkFDOUIsb0JBQW9CLEVBQUUsS0FBSzthQUM5QjtTQUNKO1FBQ0QsUUFBUSxFQUFFO1lBQ04sSUFBSSxFQUFFLE9BQU87WUFDYixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsVUFBVSxFQUFFO29CQUNSLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxF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