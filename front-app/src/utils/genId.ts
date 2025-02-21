import hub from "../hub";
import Id from "../types/Id";
hub("genId");

const usedIdsMap = new Map();

/**
 * Generates a unique identifier based on specified parts.
 * @param [parts] - The number of parts or an array of parts. Defaults to [1, 1].
 * @returns The generated unique identifier.
 */
function genId(parts: number[] = [1, 1]): Id {
    const time = getTime();
    const id = getUniqueRandom(time, parts);
    return id;
}

/**
 * Generates a unique random identifier based on time and parts.
 * @private
 * @param time - The current time in a base36 string format.
 * @param parts - An array of parts to be used for generating the identifier.
 * @returns The unique random identifier.
 */
function getUniqueRandom(time: string, partsSchema: number[]) {
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

function getRandom(unix: number) {
    return (Math.floor(Math.random() * Math.pow(36, unix))).toString(36);
}

function getTime() {
    return new Date().getTime().toString(36);
}

export default genId;