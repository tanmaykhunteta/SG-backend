const constants = require('../config/constant')

export class CustomError extends Error {
    constructor(errObj) {
        super(errObj.message);
        this.name = errObj.name;
        this.status = errObj.status || 500;
        this.code = errObj.code || constants.ERR_C.internalError
    }
}