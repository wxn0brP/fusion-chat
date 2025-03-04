import db from "../../dataBase.js";
import deleteAccount from "../../logic/deleteAccount.js";
import sendMail from "../../logic/mail.js";
import { activeTasks } from "../index.js";
export default async (data, taskId) => {
    if (!activeTasks.has(taskId))
        return;
    const uid = data.user;
    const user = await db.data.findOne("user", { _id: uid });
    if (!user)
        return;
    await deleteAccount(uid);
    const name = user.name;
    if (global.logsConfig.mail.deletedAccount)
        sendMail("deletedAccount", user.email, name);
    await db.system.removeOne("tasks", { _id: taskId });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlQWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2JhY2svc2NoZWR1bGUvYWN0aW9ucy9kZWxldGVBY2NvdW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEtBQUssQ0FBQztBQUNyQixPQUFPLGFBQWEsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLFFBQVEsTUFBTSxhQUFhLENBQUM7QUFHbkMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV2QyxlQUFlLEtBQUssRUFBRSxJQUFrQixFQUFFLE1BQVUsRUFBRSxFQUFFO0lBQ3BELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUFFLE9BQU87SUFFckMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUN0QixNQUFNLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFlLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZFLElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTztJQUVsQixNQUFNLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ3ZCLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYztRQUNyQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVqRCxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELENBQUMsQ0FBQSJ9