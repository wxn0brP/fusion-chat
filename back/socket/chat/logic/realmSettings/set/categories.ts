import { Settings_AllData } from "../set";
import { Db_RealmConf, Id, processDbChanges, Socket_RealmSettings, Socket_User } from "./imports";
import { saveDbChanges } from "./utils";

export default async (id: Id, data: Socket_RealmSettings, suser: Socket_User, dbData: Settings_AllData) => {
    const oldCategories: Db_RealmConf.category[] = dbData.filter(d => "cid" in d);
    const changes = processDbChanges(oldCategories, data.categories, ["name", "i"], "cid");
    await saveDbChanges(id, changes, "cid");
}