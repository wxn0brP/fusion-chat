export default class ValidError{
    constructor(module){
        this.module = module;
    }

    valid(...err){
        return {
            err: ["error.valid", this.module, ...err]
        }
    }

    err(...err){
        return {
            err: ["error", this.module, ...err]
        }
    }
}