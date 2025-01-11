import type db from "@wxn0brp/db/database.d.ts";
import type graph from "@wxn0brp/db/graph.d.ts";

export interface dbs {
    data: db,
    dataGraph: graph,
    system: db,
    logs: db,

    mess: db,
    userData: db,
    botData: db,

    realmConf: db,
    realmRoles: db,
    realmUser: db,
    realmData: db,
    realmDataGraph: graph
}