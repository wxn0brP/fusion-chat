import utils from "#utils/utils";
import { Id } from "#types/base";
import apiVars from "#core/store/api";

export function sortPrivs(data: Id[]): Id[] {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
        const la = apiVars.lastMess["$" + a]?.main;
        const lb = apiVars.lastMess["$" + b]?.main;
        if (!la || !lb) return 0;

        return utils.extractTimeFromId(lb.mess) - utils.extractTimeFromId(la.mess);
    });

    return sortedData;
}
