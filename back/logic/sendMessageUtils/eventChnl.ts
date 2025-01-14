import NodeCache from "node-cache";
import db from "../../dataBase.js";
import { combineId } from "../chatMgmt.js";
import sendMessage from "../sendMessage.js";
import { Id } from "../../types/base.js";
import { Message } from "../../types/sendMessage.js";
import Db_RealmData from "../../types/db/realmData.js";

const eventSubscribeCache = new NodeCache();

async function eventChnl(realm: Id, data: Message){
    const subs = await getSubscribed(realm, data.chnl);
    if(subs.length == 0) return;

    subs.forEach(async ({ tr, tc }) => {
        const req = {
            to: tr,
            msg: data.msg,
            chnl: tc,
        }
        const user = {
            _id: combineId(tr, tc),
            name: "Event Chnl",
        }
        const opts = {
            system: true,
            frPrefix: "("
        }
        sendMessage(req, user, opts);
    });
}

/**
 * Gets all tr, tc for given realm and chnl.
 * @param realm - Name of source realm.
 * @param chnl - Name of source channel.
 * @returns List of tr, tc.
 */
async function getSubscribed(realm: Id, chnl: Id): Promise<Array<Pick<Db_RealmData.events_channels, "tr" | "tc">>>{
    let realmData = eventSubscribeCache.get(realm);

    if(!realmData){
        const chnls = await db.realmData.find<Db_RealmData.events_channels>("events.channels", { sr: realm });

        realmData = {};
        chnls.forEach(({ sr, sc, tr, tc }) => {
            const key = `${sr}:${sc}`;
            if(!realmData[key]){
                realmData[key] = [];
            }
            realmData[key].push({ tr, tc });
        });

        eventSubscribeCache.set(realm, realmData);
    }

    const key = `${realm}:${chnl}`;
    return realmData[key] || [];
}

export function clearEventCache(realm: string){
    eventSubscribeCache.del(realm);
}

export default eventChnl;