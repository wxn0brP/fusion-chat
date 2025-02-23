import Id from "#id";

export function extractTimeFromId(id: Id): number{
    if(!id) return;
    const timePart = id.split("-")[0];
    const timeUnix = parseInt(timePart, 36);
    return timeUnix;
}