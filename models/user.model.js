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
    gender : {type: Boolean, enum : ["male", "female"]},
    dob : Date,
    addr : Address,
    mob : Mobile,
    role : {type: String, default: config.ROLES.USER},
    tmp_tkn : String
})

/**
 * returns an mongo doc searched by email
 * 
 * @param {String} email 
 * @param {String | Object} fields space separated field string or object
 * @returns {Promise<User>}
 */
User.statics.findUserByEmail = (email, fields) => {
    return mongoose.model(modelName).findOne({email: email}, fields);
} 

const model = mongoose.model(modelName, User);
module.exports = model;