import { permissionCache } from "../../../../../logic/chnlPermissionCache";
import { Settings_AllData } from "../set";
import { Db_RealmConf, Id, processDbChanges, Socket_RealmSettings, Socket_User } from "./imports";
import { saveDbChanges } from "./utils";

export default async (id: Id, data: Socket_RealmSettings, suser: Socket_User, dbData: Settings_AllData) => {
    const oldChannels: Db_RealmConf.channel[] = dbData.filter(d => "chid" in d);
    const changes = processDbChanges(oldChannels, data.channels, ["name", "i", "rp", "desc"], "chid");
    await saveDbChanges(id, changes, "chid");

    for(const item of changes.itemsToUpdate){
        permissionCache.clearChannelCache(id, item.chid);
    }
}