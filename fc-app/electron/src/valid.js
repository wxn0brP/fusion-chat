const valid = {
    str(data, min=0, max=Number.MAX_SAFE_INTEGER){
        return typeof data == "string" && data.length >= min && data.length <= max;
    },
    num(data, min=0, max=Number.MAX_SAFE_INTEGER){
        return typeof data == "number" && data >= min && data <= max;
    },
    bool(data){
        return typeof data == "boolean";
    },
    arr(arr, min=0, max=Number.MAX_SAFE_INTEGER){
        return Array.isArray(arr) && arr.length >= min && arr.length <= max;
    },
    obj(data){
        return typeof data == "object" && !Array.isArray(data);
    }
}

module.exports = valid;