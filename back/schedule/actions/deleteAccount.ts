import db from "#db";
import deleteAccount from "#logic/deleteAccount";
import sendMail from "#logic/mail";
import Id from "#id";
import Db_Data from "#types/db/data";
import { activeTasks } from "../index";

export default async (data: { user: Id }, taskId: Id) => {
    if (!activeTasks.has(taskId)) return;

    const uid = data.user;
    const user = await db.data.findOne<Db_Data.user>("user", { _id: uid });
    if (!user) return;

    await deleteAccount(uid);
    const name = user.name;
    if (global.logsConfig.mail.deletedAccount)
        sendMail("deletedAccount", user.email, name);

    await db.system.removeOne("tasks", { _id: taskId });
}