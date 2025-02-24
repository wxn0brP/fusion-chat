import hub from "../hub.js";
hub("genId");
const usedIdsMap = new Map();
function genId(parts = [1, 1]) {
    const time = getTime();
    const id = getUniqueRandom(time, parts);
    return id;
}
function getUniqueRandom(time, partsSchema) {
    const parts = partsSchema.map(l => getRandom(l));
    const id = [time, ...parts].join("-");
    if (usedIdsMap.has(id)) {
        time = getTime();
        return getUniqueRandom(time, partsSchema);
    }
    usedIdsMap.set(id, true);
    setTimeout(() => {
        usedIdsMap.delete(id);
    }, 1000);
    return id;
}
function getRandom(unix) {
    return (Math.floor(Math.random() * Math.pow(36, unix))).toString(36);
}
function getTime() {
    return new Date().getTime().toString(36);
}
export default genId;
//# sourceMappingURL=genId.js.map