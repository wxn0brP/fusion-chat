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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZVNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2svc29ja2V0L2NoYXQvdmFsaWQvbWVzc2FnZVNlYXJjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxlQUFlO0lBQ1gsSUFBSSxFQUFFLFFBQVE7SUFDZCxVQUFVLEVBQUU7UUFDUixJQUFJLEVBQUU7WUFDRixJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxJQUFJO1NBQ2hCO1FBQ0QsUUFBUSxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsSUFBSTtTQUNoQjtRQUNELE1BQU0sRUFBRTtZQUNKLEtBQUssRUFBRTtnQkFDSCxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtnQkFDdkMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7YUFDckM7U0FDSjtRQUNELE1BQU0sRUFBRTtZQUNKLElBQUksRUFBRSxRQUFRO1lBQ2QsTUFBTSxFQUFFLE1BQU07U0FDakI7UUFDRCxLQUFLLEVBQUU7WUFDSCxLQUFLLEVBQUU7Z0JBQ0gsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUU7Z0JBQ3ZDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO2FBQ3JDO1NBQ0o7UUFDRCxNQUFNLEVBQUU7WUFDSixJQUFJLEVBQUUsU0FBUztTQUNsQjtRQUNELE9BQU8sRUFBRTtZQUNMLElBQUksRUFBRSxRQUFRO1lBQ2QsU0FBUyxFQUFFLENBQUM7WUFDWixTQUFTLEVBQUUsR0FBRztTQUNqQjtLQUNKO0lBQ0Qsb0JBQW9CLEVBQUUsS0FBSztDQUM5QixDQUFDIn0=