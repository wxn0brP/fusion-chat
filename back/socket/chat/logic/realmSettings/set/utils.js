import db from "../../../../../dataBase.js";

/**
 * Save database changes
 */
export async function saveDbChanges(doc, changes, idName = "_id") {
    const { itemsToAdd, itemsToRemove, itemsToUpdate, itemsWithRemovedFields } = changes;
    const dbc = db.realmConf.c(doc);

    for (const item of itemsToAdd) {
        await dbc.add(item, false);
    }

    for (const item of itemsToRemove) {
        await dbc.remove(
            (item, ctx) => item[ctx.idName] === ctx.item[ctx.idName],
            { item, idName }
        );
    }

    for (const item of itemsToUpdate) {
        await dbc.update(
            (item, ctx) => item[ctx.idName] === ctx.item[ctx.idName],
            item,
            { item, idName }
        );
    }

    for (const item of itemsWithRemovedFields) {
        await dbc.update(
            (item, ctx) => item[ctx.idName] === ctx.item[ctx.idName],
            (item, ctx) => {
                for (const deletedParam of ctx.item.deletedParams) {
                    delete item[deletedParam];
                }
                return item;
            },
            { item, idName }
        );
    }
}