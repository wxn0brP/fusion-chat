import { processDbChanges } from "./imports";
import { saveDbChanges } from "./utils";

export default async (id, data, suser, dbData) => {
    const oldCategories = dbData.filter(d => !!d.cid);
    const changes = processDbChanges(oldCategories, data.categories, ["name", "i"], "cid");
    await saveDbChanges(id, changes, "cid");
}