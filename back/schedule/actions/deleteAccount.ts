import db from "../../dataBase.js";
import deleteAccount from "../../logic/deleteAccount.js";
import sendMail from "../../logic/mail.js";
import { Id } from "../../types/base.js";
import Db_Data from "../../types/db/data.js";

export default async (data: { user: string }, taskId: Id) => {
    const uid = data.user;
    const user = await db.data.findOne<Db_Data.user>("user", { _id: uid });
    if(!user) return;

    const task = await db.system.findOne("tasks", { _id: taskId });
    if(!task) return;

    await deleteAccount(uid);
    const name = user.name;
    if(global.logsConfig.mail.deletedAccount)
        sendMail("deletedAccount", user.email, name);

    await db.system.removeOne("tasks", { _id: taskId });
}