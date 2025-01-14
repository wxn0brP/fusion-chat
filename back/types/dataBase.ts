import db from "@wxn0brp/db/dist/esm/database.js";
import graph from "@wxn0brp/db/dist/esm/graph.js";

export interface FC_DataBases {
    data?: db,
    dataGraph?: graph,
    system?: db,
    logs?: db,

    mess?: db,
    userData?: db,
    botData?: db,

    realmConf?: db,
    realmRoles?: db,
    realmUser?: db,
    realmData?: db,
    realmDataGraph?: graph
}