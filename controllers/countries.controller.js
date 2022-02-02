const Async = require('async');
const utils = require('../utils/utils')
const config = require('../config/config');
const CountriesDB = require('../models/countries.model');


exports.getCountriesAll = function(req, res, next) {
    let fields = "";
    let returnFields;

    if(!(req.query?.return instanceof Array))
        returnFields = [req.query.return]

    const schemaFields = ["code", "name", "_id", "language", "currency", "capital"]

    if( returnFields.length > 0 && returnFields.length <= schemaFields.length) { //protecting against malicious large array
        const fieldsInvalid = returnFields.some((field) => schemaFields.indexOf(field) == -1)
        if(fieldsInvalid) 
            return utils.createResponse(req, res, 400, false, "invalid return field specified");
        
        fields = "-_id "
        fields += returnFields.join(' ');
    } 

    CountriesDB.find({}, fields, {}, (err, countries)=>{
        if(err)
            return next(utils.createError("Failed to fetch countries"), req, res, next);
        
        utils.createResponse(req, res, 200, true, "countries list", countries);
    });
}