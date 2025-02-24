import NodeCache from "node-cache";
import db from "#db";
import { combineId } from "../chatMgmt";
import sendMessage from "../sendMessage";
import Id from "#id";
import { Message } from "#types/sendMessage";
import Db_RealmData from "#types/db/realmData";
import getCacheSettings from "../cacheSettings";

const announcementSubscribeCache = new NodeCache(getCacheSettings("AnnouncementSubscribe"));

async function announcementChnl(realm: Id, data: Message){
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
async function getSubscribed(realm: Id, chnl: Id): Promise<Array<Pick<Db_RealmData.announcement_channels, "tr" | "tc">>>{
    let realmData = announcementSubscribeCache.get(realm);

    if(!realmData){
        const chnls = await db.realmData.find<Db_RealmData.announcement_channels>("announcement.channels", { sr: realm });

        realmData = {};
        chnls.forEach(({ sr, sc, tr, tc }) => {
            const key = `${sr}:${sc}`;
            if(!realmData[key]){
                realmData[key] = [];
            }
            realmData[key].push({ tr, tc });
        });

        announcementSubscribeCache.set(realm, realmData);
    }

    const key = `${realm}:${chnl}`;
    return realmData[key] || [];
}

export function clearEventCache(realm: string){
    announcementSubscribeCache.del(realm);
}

export default announcementChnl;