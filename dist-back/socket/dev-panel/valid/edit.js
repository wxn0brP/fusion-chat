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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2JhY2svc29ja2V0L2Rldi1wYW5lbC92YWxpZC9lZGl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQztBQUVoQyxlQUFlO0lBQ1gsSUFBSSxFQUFFLFFBQVE7SUFDZCxVQUFVLEVBQUU7UUFDUixJQUFJLEVBQUU7WUFDRixJQUFJLEVBQUUsUUFBUTtZQUNkLFVBQVUsRUFBRTtnQkFDUixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRTthQUN4RDtZQUNELFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNsQixvQkFBb0IsRUFBRSxLQUFLO1NBQzlCO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFO29CQUNGLElBQUksRUFBRSxPQUFPO29CQUNiLEtBQUssRUFBRTt3QkFDSCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxJQUFJLEVBQUUsT0FBTztxQkFDaEI7aUJBQ0o7YUFDSjtZQUNELFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztTQUNyQjtLQUNKO0lBQ0QsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztJQUMxQixvQkFBb0IsRUFBRSxLQUFLO0NBQzlCLENBQUEifQ==