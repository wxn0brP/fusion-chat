import { processDbChanges } from "./imports.js";

export default async(id, data) => {
    
    const oldUsers = await global.db.realmUser.find(id, {});
    let newData = data.users;
    
    const changes = processDbChanges(oldUsers, newData, ["u", "r"], "u");
    
    for (const item of changes.itemsToUpdate) {
        await global.db.realmUser.update(id, { uid: item.u }, item);
    }
}