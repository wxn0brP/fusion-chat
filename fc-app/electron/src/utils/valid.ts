const valid = {
    str(data: any, min = 0, max = Number.MAX_SAFE_INTEGER) {
        return typeof data == "string" && data.length >= min && data.length <= max;
    },
    num(data: any, min = 0, max = Number.MAX_SAFE_INTEGER) {
        return typeof data == "number" && data >= min && data <= max;
    },
    bool(data: any) {
        return typeof data == "boolean";
    },
    arr(arr: any, min = 0, max = Number.MAX_SAFE_INTEGER) {
        return Array.isArray(arr) && arr.length >= min && arr.length <= max;
    },
    obj(data: any) {
        return typeof data == "object" && !Array.isArray(data);
    }
}

export default valid;