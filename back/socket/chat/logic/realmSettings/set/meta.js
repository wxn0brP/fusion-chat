import { unlinkSync } from "fs";
import db from "../../../../../dataBase.js";

export default async (id, data) => {
    await db.realmConf.updateOne(id, { _id: "set" }, data.meta);
    if(!data.meta.img){
        try{
            unlinkSync("userFiles/realms/" + id + ".png");
        }catch{}
    }
}