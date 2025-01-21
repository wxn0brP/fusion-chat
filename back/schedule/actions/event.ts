import { Id } from "@wxn0brp/db";
import { activeTasks } from "../index";
import db from "../../dataBase";
import Db_RealmData from "../../types/db/realmData";

export default async (data: { realm: Id, evt: Id }, taskId: Id) => {
    if(!activeTasks.has(taskId)) return;

    const users = await db.realmData.find<Pick<Db_RealmData.event_user, "u">>(data.realm, { uevt: data.evt }, {}, {}, { select: ["u"] });
    users.forEach(({ u }) => {
        global.sendToSocket(u, "realm.event.notify", data.realm, data.evt);
    })
    // TODO add firebase notification
}