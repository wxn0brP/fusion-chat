import db from "../../../../../dataBase";
import { ProcessDbChangesResult } from "./imports";

/**
 * Save database changes
 */
export async function saveDbChanges(doc: string, changes: ProcessDbChangesResult, idName: string = "_id") {
    const { itemsToAdd, itemsToRemove, itemsToUpdate, itemsWithRemovedFields } = changes;
    const dbc = db.realmConf.c(doc);
    
    for (const item of itemsToAdd) {
        await dbc.add(item, false);
    }

    for (const item of itemsToRemove) {
        await dbc.remove(
            { [idName]: item[idName] },
            { item, idName }
        );
    }

    for (const item of itemsToUpdate) {
        await dbc.update(
            { [idName]: item[idName] },
            item
        );
    }

    for (const item of itemsWithRemovedFields) {
        const unset = Object.fromEntries(
            item.deletedParams.map((p) => [p, true])
        );

        await dbc.update(
            { [idName]: item[idName] },
            { $unset: unset }
        );
    }
}