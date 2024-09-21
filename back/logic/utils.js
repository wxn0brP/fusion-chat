export function extractTimeFromId(id){
    if(!id) return;
    const timePart = id.split("-")[0];
    const timeUnix = parseInt(timePart, 36);
    return timeUnix;
}