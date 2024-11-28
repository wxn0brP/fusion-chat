import { processDbChanges } from "./imports.js";
import { saveDbChanges } from "./utils.js";

export default async (id, data, suser, dbData) => {
    const oldCategories = dbData.filter(d => !!d.cid);
    const changes = processDbChanges(oldCategories, data.categories, ["name", "i"], "cid");
    await saveDbChanges(id, changes, "cid");
}