import { unlinkSync } from "fs";
import { db, Id, Socket_RealmSettings } from "./imports";

export default async (id: Id, data: Socket_RealmSettings) => {
    await db.realmConf.updateOne(id, { _id: "set" }, data.meta);
    if(!data.meta.img){
        try{
            unlinkSync("userFiles/realms/" + id + ".png");
        }catch{}
    }
}