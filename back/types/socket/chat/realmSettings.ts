import Db_RealmConf from "../../db/realmConf";
import Db_RealmData from "../../db/realmData";
import Db_RealmRoles from "../../db/realmRoles";
import Db_RealmUser from "../../db/realmUser";

export interface Socket_RealmSettings {
    meta?: Db_RealmConf.meta,
    categories?: Db_RealmConf.category[],
    channels?: Db_RealmConf.channel[],
    roles?: Db_RealmRoles.role[],
    users?: Db_RealmUser.user[],
    emojis?: Db_RealmConf.emoji[],
    webhooks?: Db_RealmConf.webhook[],
    banUsers?: Db_RealmData.ban[]
}