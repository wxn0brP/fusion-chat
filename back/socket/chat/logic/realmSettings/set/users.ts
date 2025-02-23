import Db_RealmUser from "#types/db/realmUser";
import { db, Id, processDbChanges, ProcessDbChangesResult, Socket_RealmSettings } from "./imports";

export default async(id: Id, data: Socket_RealmSettings) => {
    const old_data = await db.realmUser.find<Db_RealmUser.user | Db_RealmUser.bot>(id, {});
    let new_data = data.users;
    
    const new_users = new_data.filter(user => /^[a-zA-Z0-9]/.test(user.u)).map(user => {
        return {
            u: user.u,
            r: user.r
        }
    });
    
    const old_users = old_data.filter((user: Db_RealmUser.user) => user.u);
    const changes_users = processDbChanges(old_users, new_users, ["u", "r"], "u");

    const new_bots = new_data.filter(user => user.u.startsWith("^")).map(user => {
        return {
            bot: user.u.replace("^", ""),
            r: user.r
        }
    });
    
    const old_bots = old_data.filter((user: Db_RealmUser.bot) => user.bot);
    const changes_bots = processDbChanges(old_bots, new_bots, ["bot", "r"], "bot");
    
    await saveDbChanges(id, changes_users, "u");
    await saveDbChanges(id, changes_bots, "bot");
}

async function saveDbChanges(realmId: Id, changes: ProcessDbChangesResult, trackName: string){
    const itemsToUpdate = changes.itemsToUpdate;

    for(const item of itemsToUpdate){
        await db.realmUser.updateOne(
            realmId,
            { [trackName]: item[trackName] },
            item
        );
    }
}