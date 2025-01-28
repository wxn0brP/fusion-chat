import NodeCache from "node-cache";
import { Id } from "../types/base";
import Status from "../types/socket/chat/status";
import getCacheSettings from "./cacheSettings";

const h2 = 2 * 60 * 60 * 1000; //2 hours in ms

export const cache = new NodeCache(getCacheSettings("UserStatus"));

export function setCache(userId: Id, state: Status){
    let endTime = state.endTime;
    if(state.endTime){
        if(state.endTime < Date.now()) return 1;
        if(state.endTime < state.startTime) return 2;
        endTime = state.endTime;
    }
    if(state.startTime > Date.now()) state.startTime = Date.now();
    let ttl = endTime - Date.now();
    if(ttl > h2){ // 2h
        endTime = Date.now() + h2;
        state.endTime = endTime;
    }

    if(endTime){
        cache.set(userId, state, ttl);
    }else{
        cache.set(userId, state);
    }
    return 0;
}

export function getCache(userId: Id){
    return cache.get(userId);
}

export function rmCache(userId: Id){
    cache.del(userId);
}