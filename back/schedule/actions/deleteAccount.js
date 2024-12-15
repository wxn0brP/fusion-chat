import deleteAccount from "../../logic/deleteAccount.js";
import sendMail from "../../logic/mail.js";

export default async (data, taskId) => {
    const uid = data.user;
    const user = await global.db.data.findOne("user", { _id: uid });
    if(!user) return;

    const task = await global.db.system.findOne("tasks", { _id: taskId });
    if(!task) return;

    await deleteAccount(uid);
    const name = user.name;
    if(global.logsConfig.mail.deletedAccount)
        sendMail("deletedAccount", user.email, name);

    await global.db.system.removeOne("tasks", { _id: taskId });
}