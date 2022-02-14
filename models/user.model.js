const config = require('../config/config');
const constants = require('../config/constant');
const mongoose = require('mongoose');
const utils = require('../utils/utils');
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
    em_verified : {type : Boolean, default : false},
    em_verified_on : Date,
    gndr : {type: String, enum : constants.GENDERS},
    yob : Number,
    age : Number,
    cntry : String,
    ttl_reward : {type : Number, default : constants.REWARD_TYPES['signed_up']},
    ttl_reward_claimed: {type: Number, default: 0}, 
    addr : Address,
    mob : Mobile,
    role : {type: String, default: constants.ROLES.USER},
    prvcyPlcy: Boolean
}, {
    timestamps : true
})

User.pre('save', function(next) {
    const user = this
    if(user.isModified('yob')) {
        user.age = (new Date()).getFullYear() - user.yob
    } 
    next();
})


/**
 * returns an mongo doc searched by email
 * 
 * @param {String} email 
 * @param {String | Object} fields (optional) space separated field string or object
 * @param {Function} cb (optional) (err, result)
 * @returns {Promise<User>}
 */
User.statics.findUserByEmail = (email, fields=null) => {
    const cond = {email: email};
    fields = fields || {};
    const collection = mongoose.model(modelName)

    return collection.findOne(cond, fields)
} 


User.statics.getAll = (options) => {

    mongoose.model(modelName).find({}, {}, {})
}


User.statics.verifyEmail = (tokenData) => {
    const cond = {email:tokenData.email, role: tokenData.role, em_verified : false}
    const update = {$set : {em_verified: true, em_verified_on : new Date()}, $inc: {ttl_reward : constants.REWARD_TYPES.email_verified}}
    const options = {new: true}

    return mongoose.model(modelName).findOneAndUpdate(cond, update, options);
}


const model = mongoose.model(modelName, User);
module.exports = model;