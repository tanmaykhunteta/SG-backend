const config = require('../config/config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const modelName = "countries"


const Country = new Schema({ 
    code : {type: String, required: true, unique: true},
    name : {type: String, required: true},
    capital: String,
    region: String,
    currency: {
        code: String,
        name: String,
        symbol: String
    },
    language: {
        code: String,
        name: String
    },
    flag: String
}, {
    timestamps : true
})


Country.statics.getCountryByCode = function(code, fields=null, cb=null) {
    cond = {cntry_code: code}
    const collection = mongoose.model(modelName)
    if(cb && typeof cb == "function") {
        return collection.findOne(cond, fields, {}, cb); //calls with cb (last argument)
    }

    return collection.findOne(cond, fields) //without cb returns promise.
}


Country.statics.getCountryByName = function(name, fields=null, cb=null) {
    cond = {cntry_nm: name}
    const collection = mongoose.model(modelName)
    if(cb && typeof cb == "function") {
        return collection.findOne(cond, fields, {}, cb);
    }

    return collection.findOne(cond, fields)
}



const model = mongoose.model(modelName, Country);
module.exports = model;