const fs = require('fs');
const path = require('path');


/**
 * Initializes ajv instance with all the json schemas (compilation for application lifetime).
 * 
 * Traverse through validators dir and imports all schemas and then add it to ajv
 * 
 * @param { object } ajv ajv instance passed
 */
exports.initializeValidatorSchemas = function(ajv) {
    console.log("------------ Initializing Validators -----------------")

    const schemasPath = path.join(__dirname, '..', 'validators');
    const schemas = fs.readdirSync(schemasPath);
    schemas.forEach((schema) => {
        const schemaExports = require(path.join(schemasPath + '/' + schema));
        for(let schema in schemaExports) { // if multiple exported schema in one file
            if(schemaExports[schema].type == "object") {
                ajv.addSchema(schemaExports[schema])
            }
        }
    })
}

