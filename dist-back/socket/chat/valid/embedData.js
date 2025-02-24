export default {
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
    required: ["title"],
    additionalProperties: false
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1iZWREYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFjay9zb2NrZXQvY2hhdC92YWxpZC9lbWJlZERhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsZUFBZTtJQUNYLElBQUksRUFBRSxRQUFRO0lBQ2QsVUFBVSxFQUFFO1FBQ1IsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUN6QixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO1FBQ3ZCLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDL0IsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUN6QixZQUFZLEVBQUU7WUFDVixJQUFJLEVBQUUsUUFBUTtZQUNkLG9CQUFvQixFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtTQUMzQztLQUNKO0lBQ0QsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDO0lBQ25CLG9CQUFvQixFQUFFLEtBQUs7Q0FDOUIsQ0FBQSJ9