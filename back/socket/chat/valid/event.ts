export default {
    type: "object",
    properties: {
        type: { type: "string", enum: ["voice", "custom"] },
        where: { type: "string" },
        topic: { type: "string" },
        time: { type: "number" },
        desc: { type: "string" },
        img: { type: "string" },
    },
    required: ["type", "where", "topic", "time"],
    additionalProperties: false
}