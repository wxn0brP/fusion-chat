import { forgeValthera, ValtheraRemote } from "@wxn0brp/db";
import { Valthera } from "@wxn0brp/db/valthera";
import { FC_DataBases } from "./types/dataBase";
import { loadConfig } from "./loadConfig";

const config = await loadConfig("database");

const db: FC_DataBases = {};

const databases = [
	"data", //all types data
	"dataGraph", //all types data graph
	"system", //system config and data
	"logs", //logs

	"mess", //messages
	"userData", //user data
	"botData", //bot data

	"realmConf", //realm settings
	"realmRoles", //realm roles
	"realmUser", //realm users
	"realmData", //realm all types data
	"realmDataGraph", ////realm all types data graph
];

function getRemoteConfig(name: string, path: string) {
	const cnf = {
		name,
		path,
		url: null,
		auth: null,
	};
	const custom = config[name];
	if (custom.url && custom.auth) {
		cnf.url = custom.url;
		cnf.auth = custom.auth;
	} else {
		cnf.url = config.remoteDefault.url;
		cnf.auth = config.remoteDefault.auth;
	}
	return cnf;
}

async function initValthera(name: string) {
	const cfg = config[name];
	if (cfg.type === "local") {
		return new Valthera(cfg.path);
	} else if (cfg.type === "remote") {
		const remoteCfg = getRemoteConfig(name, cfg.path);
		return new ValtheraRemote(remoteCfg);
	} else {
		throw new Error("Unknown database type " + cfg.name);
	}
}

for (const dbName of databases) {
	db[dbName] = forgeValthera(await initValthera(dbName));
}

export default db;
