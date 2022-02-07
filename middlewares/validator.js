const validatorSchemas = require('../validators/index');
const Ajv = require('ajv');
const utils = require('../utils/utils');
const constants = require('../config/constant')

module.exports = {
    ajv : null,

    init : () => {
        this.ajv = new Ajv({$data : true});
        validatorSchemas.initializeValidatorSchemas(this.ajv);
    },

    /**
     * validates data with ajv
     * 
     * @param {string} schemaRef  - Schema $id to identify schema to be used for validation
     * @param {string} apiName - Specific validation for specific api, we add this as special field in req body, as our json schema checks special conditions based on the api been called.
     * @param {String} dataField -  Where the data resides in req obj
     * @return middleware
     */
    validate : (schemaRef, apiName, dataField = 'body') => {
        return (req, res, next) => {
            const data = {...req[dataField], apiPath : apiName}
            const validate = this.ajv.getSchema(schemaRef);
            if(validate(data)) {
                return next();
            } else {
                const errors = [...validate.errors]
                const erArr = errors.map((error) => error.instancePath.split('/')[1])
                return utils.createResponse(req, res, 400, false, "validations failed", {validationErrors: erArr}, constants.ERR_C['validationErr']);
            }
        }
    }
}
