import NodeCache from "node-cache";
import { Id } from "../types/base";
import db from "../dataBase";
import Db_RealmUser from "../types/db/realmUser";
import getCacheSettings from "./cacheSettings";

const cache = new NodeCache(getCacheSettings("UserOnRealm"));

export async function checkIsUserOnRealm(userId: Id, realm: Id): Promise<boolean> {
    if(cache.has(`${userId}:${realm}`)) return cache.get<boolean>(`${userId}:${realm}`);

    const result = await db.realmUser.findOne<Db_RealmUser.user>(realm, { u: userId });
    cache.set(`${userId}:${realm}`, !!result);
    return !!result;
}

export function clearCache(userId: Id, realm: Id){
    cache.del(`${userId}:${realm}`);
}