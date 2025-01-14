import NodeCache from "node-cache";

const defTTL = 2 * 60;
const h2 = 2 * 60 * 60 * 1000; //2 hours in ms

export const cache = new NodeCache({
    stdTTL: defTTL, // 2min
    checkperiod: 15 * 60 // 15min
});

export function setCache(userId, state){
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

export function getCache(userId){
    return cache.get(userId);
}

export function rmCache(userId){
    cache.del(userId);
}