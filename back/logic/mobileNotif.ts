import nodeCache from "node-cache";
import { decode, create, KeyIndex } from "./token/index.js";
import { randomBytes } from "crypto";
import { genId } from "@wxn0brp/db";
import { Id } from "../types/base.js";

export const cache = new nodeCache({
    stdTTL: 2 * 60,
    checkperiod: 15 * 60,
});

export async function createTokenPointer(user, token){
    const random = randomBytes(32).toString("hex");
    const id = genId();

    const pointer = await create({ id, random, user }, "2m", KeyIndex.TEMPORARY);
    
    cache.set(id, token);
    return pointer;
}

export async function getTokenFromPointer(pointerToken){
    const data = await decode(pointerToken, KeyIndex.TEMPORARY) as { id: Id, user: Id };
    if(!data) return null;

    const userToken = cache.get(data.id);
    if(!userToken) return null;

    const userTokenData = await decode(userToken, KeyIndex.USER_TOKEN);
    if(!userTokenData) return null;

    return {
        user: data.user,
        token: userToken,
        exp: userTokenData.exp
    }
}