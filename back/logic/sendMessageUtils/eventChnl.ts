import NodeCache from "node-cache";
import db from "../../dataBase.js";
import { combineId } from "../chatMgmt.js";
import sendMessage from "../sendMessage.js";

const eventSubscribeCache = new NodeCache();

async function eventChnl(realm, data){
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
 * @param {string} realm - Name of source realm.
 * @param {string} chnl - Name of source channel.
 * @returns {Promise<Array<{ tr: string, tc: string }>>} - List of tr, tc.
 */
async function getSubscribed(realm, chnl){
    let realmData = eventSubscribeCache.get(realm);

    if(!realmData){
        const chnls = await db.realmData.find("events.channels", { sr: realm });

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

export function clearEventCache(realm){
    eventSubscribeCache.del(realm);
}

export default eventChnl;