import { realm_settings_get, realm_settings_set, realm_webhook_token_get } from "./logic/realmSettings.js";
export default (socket) => {
    socket.onLimit("realm.settings.get", 5_000, async (id, sections, cb) => {
        try {
            if (typeof sections == "function" && !cb) {
                cb = sections;
                sections = [];
            }
            const data = await realm_settings_get(socket.user, id, sections);
            if (socket.processSocketError(data))
                return;
            if (cb)
                cb(data.res, id);
            else
                socket.emit("realm.settings.get", data.res, id);
        }
        catch (e) {
            socket.logError(e);
        }
    });
    socket.onLimit("realm.settings.set", 5_000, async (id, data, cb) => {
        try {
            const event_data = await realm_settings_set(socket.user, id, data);
            if (cb) {
                if (!event_data.err)
                    return cb(false);
                return cb(...event_data.err);
            }
            socket.processSocketError(event_data);
        }
        catch (e) {
            socket.logError(e);
        }
    });
    socket.onLimit("realm.webhook.token.get", 5_000, async (realmId, tokenId, cb) => {
        try {
            const data = await realm_webhook_token_get(socket.user, realmId, tokenId);
            if (socket.processSocketError(data))
                return;
            if (cb)
                cb(data.res);
            else
                socket.emit("realm.webhook.token.get", data.res);
        }
        catch (e) {
            socket.logError(e);
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbG1TZXR0aW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2JhY2svc29ja2V0L2NoYXQvcmVhbG1TZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQ0gsa0JBQWtCLEVBQ2xCLGtCQUFrQixFQUNsQix1QkFBdUIsRUFDMUIsTUFBTSx1QkFBdUIsQ0FBQztBQUcvQixlQUFlLENBQUMsTUFBYyxFQUFFLEVBQUU7SUFDOUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQU0sRUFBRSxRQUFRLEVBQUUsRUFBWSxFQUFFLEVBQUU7UUFDakYsSUFBSSxDQUFDO1lBQ0QsSUFBSSxPQUFPLFFBQVEsSUFBSSxVQUFVLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDdkMsRUFBRSxHQUFHLFFBQVEsQ0FBQztnQkFDZCxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxNQUFNLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2pFLElBQUksTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQztnQkFBRSxPQUFPO1lBQzVDLElBQUksRUFBRTtnQkFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQzs7Z0JBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQU0sRUFBRSxJQUFJLEVBQUUsRUFBWSxFQUFFLEVBQUU7UUFDN0UsSUFBSSxDQUFDO1lBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuRSxJQUFJLEVBQUUsRUFBRSxDQUFDO2dCQUNMLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRztvQkFBRSxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEMsT0FBTyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUNELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQVcsRUFBRSxPQUFXLEVBQUUsRUFBWSxFQUFFLEVBQUU7UUFDOUYsSUFBSSxDQUFDO1lBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMxRSxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7Z0JBQUUsT0FBTztZQUM1QyxJQUFJLEVBQUU7Z0JBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Z0JBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUEifQ==