import NodeCache from "node-cache";

// @ts-ignore
const configFile = await import("../../config/cache.js").then(module => module.default);

export default function getCacheSettings(settingsId: string): Partial<NodeCache.Options> {
    const config = configFile[settingsId];
    if(!config) return {};
    if(!Array.isArray(config) && config.length == 0) return {};

    const conf: Partial<NodeCache.Options> = {};
    if(config[0]) conf.stdTTL = config[0];
    if(config[1]) conf.checkperiod = config[1];
    return conf;
}