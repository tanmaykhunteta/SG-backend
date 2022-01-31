const config = require('../config/config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const modelName = "users"

const Address = new Schema({
    street : String,
    city : String,
    state : String,
    zip : String,
    country : String,
})


const Mobile = new Schema({
    code : String,
    number : String
})


const User = new Schema({ 
    fn : {type : String, required: true},
    ln : {type : String, required : true},
    email : {type : String, unique : true, required: true},
    pswd : {type : String, required : true},
    em_verified : {type : String, default : false},
    em_verified_on : Date,
    gender : {type: Boolean, enum : ["male", "female"]},
    dob : Date,
    addr : Address,
    mob : Mobile,
    role : {type: String, default: config.ROLES.USER},
}, {
    timestamps : true
})

/**
 * returns an mongo doc searched by email
 * 
 * @param {String} email 
 * @param {String | Object} fields (optional) space separated field string or object
 * @param {Function} cb (optional) (err, result)
 * @returns {Promise<User>}
 */
User.statics.findUserByEmail = (email, fields=null, cb=null) => {
    const cond = {email: email};
    fields = fields || {};
    if(cb)
        return mongoose.model(modelName).findOne(cond, fields, {}, cb);

    return mongoose.model(modelName).findOne(cond, fields)
} 


const model = mongoose.model(modelName, User);
module.exports = model;