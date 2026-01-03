import { AnotherCacheOptions } from "@wxn0brp/ac";
import { loadConfig } from "../loadConfig";

const configFile = await loadConfig("cache");

export default function getCacheSettings(
	settingsId: string,
): Partial<AnotherCacheOptions> {
	const config = configFile[settingsId];
	if (!config) return {};
	if (!Array.isArray(config) && config.length == 0) return {};

	const conf: Partial<AnotherCacheOptions> = {};
	if (config[0]) conf.ttl = config[0];
	if (config[1]) conf.cleanupInterval = config[1];
	return conf;
}
