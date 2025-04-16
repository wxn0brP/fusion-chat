import { Graph, Valthera } from "@wxn0brp/db";

export interface FC_DataBases {
    data?: Valthera,
    dataGraph?: Graph,
    system?: Valthera,
    logs?: Valthera,

    mess?: Valthera,
    userData?: Valthera,
    botData?: Valthera,

    realmConf?: Valthera,
    realmRoles?: Valthera,
    realmUser?: Valthera,
    realmData?: Valthera,
    realmDataGraph?: Graph
}