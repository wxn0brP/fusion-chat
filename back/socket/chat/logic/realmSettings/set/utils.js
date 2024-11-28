/**
 * Save database changes
 */
export async function saveDbChanges(doc, changes, idName = "_id") {
    const { itemsToAdd, itemsToRemove, itemsToUpdate, itemsWithRemovedFields } = changes;
    const db = global.db.realmConf.c(doc);

    for (const item of itemsToAdd) {
        await db.add(item, false);
    }

    for (const item of itemsToRemove) {
        await db.remove(
            (item, ctx) => item[ctx.idName] === ctx.item[ctx.idName],
            { item, idName }
        );
    }

    for (const item of itemsToUpdate) {
        await db.update(
            (item, ctx) => item[ctx.idName] === ctx.item[ctx.idName],
            item,
            { item, idName }
        );
    }

    for (const item of itemsWithRemovedFields) {
        await db.update(
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