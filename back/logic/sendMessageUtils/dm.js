import NodeCache from "node-cache";
import db from "../../dataBase.js";
import { combineId } from "../chatMgmt.js";

const blockedCache = new NodeCache();
const userDmCache = new NodeCache();

async function blocked(fr, to, combined){
    if(blockedCache.has(combined)) return blockedCache.get(combined);

    const blocked = await db.userData.findOne("blocked", {
        $or: [
            { fr: fr, to: to },
            { fr: to, to: fr }
        ]
    });
    const isBlocked = !!blocked;
    blockedCache.set(combined, isBlocked);
    return isBlocked;
}

async function exists(fr, to, combined){
    if(userDmCache.has(combined)) return userDmCache.get(combined);

    const priv = await db.userData.findOne(fr, { priv: to });
    const toPriv = await db.userData.findOne(to, { priv: fr });
    const exists = !!priv && !!toPriv;
    userDmCache.set(combined, exists);
    return exists;
}

async function checkDmChat(fr, to, combined, validE){
    const isBlocked = await blocked(fr, to, combined);
    if(isBlocked) return validE.err("blocked");

    const isExists = await exists(fr, to, combined);
    if(!isExists) return validE.err("not exists");
}

export default checkDmChat;

export function clearBlockedCache(fr, to){
    const combined = combineId(fr, to);
    blockedCache.del(combined);
}

export function clearUserDmCache(fr, to){
    const combined = combineId(fr, to);
    userDmCache.del(combined);
}