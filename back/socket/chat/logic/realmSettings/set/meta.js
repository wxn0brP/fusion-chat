import { unlinkSync } from "fs";

export default async (id, data) => {
    await global.db.realmConf.updateOne(id, { _id: "set" }, data.meta);
    if(!data.meta.img){
        try{
            unlinkSync("userFiles/realms/" + id + ".png");
        }catch{}
    }
}