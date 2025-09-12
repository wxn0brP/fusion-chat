import Id from "#id";
import db from "#db";
import Db_RealmUser from "#types/db/realmUser";
import getCacheSettings from "./cacheSettings";
import { AnotherCache } from "@wxn0brp/ac";

const cache = new AnotherCache<boolean>(getCacheSettings("UserOnRealm"));

export async function checkIsUserOnRealm(
	userId: Id,
	realm: Id,
): Promise<boolean> {
	if (cache.has(`${userId}:${realm}`))
		return cache.get(`${userId}:${realm}`);

	const result = await db.realmUser.findOne<Db_RealmUser.user>(realm, {
		u: userId,
	});
	cache.set(`${userId}:${realm}`, !!result);
	return !!result;
}

export function clearCache(userId: Id, realm: Id) {
	cache.delete(`${userId}:${realm}`);
}
