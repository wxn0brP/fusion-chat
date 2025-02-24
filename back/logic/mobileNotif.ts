import nodeCache from "node-cache";
import { decode, create, KeyIndex } from "./token/index";
import { randomBytes } from "crypto";
import { genId } from "@wxn0brp/db";
import Id from "#id";

export const cache = new nodeCache({
    stdTTL: 2 * 60,
    checkperiod: 15 * 60,
});

export async function createTokenPointer(userId: Id, token: string){
    const random = randomBytes(32).toString("hex");
    const id = genId();

    const pointer = await create({ id, random, user: userId }, "2m", KeyIndex.TEMPORARY);
    
    cache.set(id, token);
    return pointer;
}

export async function getTokenFromPointer(pointerToken: string){
    const data = await decode(pointerToken, KeyIndex.TEMPORARY) as { id: Id, user: Id };
    if(!data) return null;

    const userToken = cache.get(data.id) as string;
    if(!userToken) return null;

    const userTokenData = await decode(userToken, KeyIndex.USER_TOKEN);
    if(!userTokenData) return null;

    return {
        user: data.user,
        token: userToken,
        exp: userTokenData.exp
    }
}