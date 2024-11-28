import { processDbChanges } from "./imports.js";
import { saveDbChanges } from "./utils.js";

export default async (id, data, suser, dbData) => {
    const oldChannels = dbData.filter(d => !!d.chid);
    const changes = processDbChanges(oldChannels, data.channels, ["name", "i", "rp", "desc"], "chid");
    await saveDbChanges(id, changes, "chid");
}