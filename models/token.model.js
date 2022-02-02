const config = require('../config/config');
const mongoose = require('mongoose');
const utils = require('../utils/utils');
const Async = require('async');
const Schema = mongoose.Schema;
const modelName = "tokens"


const Token = new Schema({ 
    tkn : {type : String, unique : true},
    email : {type : String, index:true, required: true},
    role : {type: String, enum : config.ROLES, required: true},
    type : {type: String, enum : config.TOKEN_TYPES_ENUM},
    rqtIP : String,
    expired : {type: Boolean, default: false},
    createdAt : {type: Date, index: true}
}, {
    timestamps : true
})

Token.index('createdAt', {expireAfterSeconds : 10 || config.TOKEN_MAX_AGE, partialFilterExpression : {type : {$eq : config.TOKEN_TYPES.PSR}}})


/**
 * returns an mongo doc searched by email
 * 
 * @param {String} token
 * @param {String} type
 * @param {String | Object} fields (optional) space separated field string or object
 * @returns {Promise<Token>} returns Promise if no callback passe
 */
Token.statics.findByToken = (token, type, fields=null, cb=null) => {
    const cond = {tkn: token, type: type}
    fields = fields || {}
    const collection = mongoose.model(modelName)
    if(cb && typeof cb == "function")
        return collection.findOne(cond, fields, {}, cb)

    return collection.findOne(cond, fields)
} 


/**
 * insert new token data to Token collection
 * 
 * @param {Object} details details : email, role, requesterIp
 * @param {String} token unique token to verify user, generates token, if no token provided 
 * @param {Function} cb (optional) (err, result)
 * @returns {Promise}
 */
Token.statics.newEmailVerification = (details,token=null, cb=null) => {
    const collection = mongoose.model(modelName);
    return new Promise((res, rej)=>{
        Async.waterfall([
            function(cb1) {
                collection.deleteExistingToken(details.email, details.role, config.TOKEN_TYPES.EMV)
                .then((data) => {
                    cb1(null);
                }).catch((error) => {
                    cb1(error, null)
                })
            },

            function(cb1) {
                if(!token || typeof token != 'string') {
                    utils.generateRandomToken(48, 'hex')
                    .then((token)=>{
                        if(!token) return cb1("error in generating cb", null)
                        cb1(null, token);
                    }).catch((error) => cb1(error));
                }
            },
    
            function(token, cb1) {
                const body = {tkn: token, email : details.email, role : details.role, type: config.TOKEN_TYPES.EMV, ip: details.ip}
                const tokenData = new model(body);
                tokenData.save()
                .then((doc) => {
                    if(!doc) return cb1("could not save token", null);
                    cb1(null, doc);
                }).catch((error) => {
                    cb1(error, null);
                })
            }
        ], (err, result)=> {
            console.log(err);
            if(err) {
                if(!cb) 
                    return rej(err)
            };

            if(cb && typeof cb == "function"){
                cb(err, result);
            }else 
                res(result);
        })
    })
}


/**
 * insert new token data to Token collection
 * 
 * @param {Object} details details : email, role, requester ip
 * @param {String} token unique token to verify user, generates token, if no token provided 
 * @param {Function} cb (OPTIONAL) (error, result)
 * @returns {Promise}
 */
Token.statics.newPasswordReset = async (details, token=null, cb=null) => {
    return new Promise((res, rej)=>{
        const collection = mongoose.model(modelName);
        Async.waterfall([
            function(cb1) {
                collection.deleteExistingToken(details.email, details.role, config.TOKEN_TYPES.PSR)
                .then((data) => {
                    console.log('deleted token', data)
                    cb1(null);
                }).catch((error) => {
                    cb1(error, null)
                })
            },

            function(cb1) {
                if(!token || typeof token != 'string') {
                    utils.generateRandomToken(48, 'hex')
                    .then((token)=>{
                        if(!token) return cb1("error in generating cb", null)
                        cb1(null, token);
                    }).catch((error) => cb1(error));
                }
            },
    
            function(token, cb1) {
                const body = {tkn: token, email : details.email, role : details.role, type: config.TOKEN_TYPES.PSR, ip: details.ip}
                const tokenData = new model(body);
                tokenData.save()
                .then((doc) => {
                    if(!doc) return cb1("could not save token", null);
                    cb1(null, doc);
                }).catch((error) => {
                    cb1(error, null);
                })
            }
        ], (err, result)=> {
            if(err) {
                if(!cb) 
                    return rej(err)
            };

            if(cb && typeof cb == "function")
                cb(err, result);
            else 
                res(result);
        })
    })
}

/**
 * delete existing token 
 * @param {email} email 
 * @param {String} role 
 * @param {Function} cb (err, result)
 * @returns 
 */
Token.statics.deleteExistingToken = (email, role, type, cb=null) => {
    const cond = {email, role, type};
    const collection = mongoose.model(modelName)
    // if(cb && typeof cb == "function") 
    //     return collection.deleteOne(cond, {}, cb)

    // return collection.deleteOne(cond)
    const update = {$set: {expired: true}};
    if(cb && typeof cb == "function") 
        return collection.updateMany(cond, update, cb);
    
    return collection.updateMany(cond, update);
}


Token.statics.expireEMVToken = (token, cb=null) => {
    const cond = {tkn : token};
    const collection = mongoose.model(modelName);
    if(cb && typeof cb == "function") 
        return collection.deleteOne(cond, {}, (err, result)=> {
            cb(err, result.deletedCount)
        });

    return collection.deleteOne(cond);
}



const model = mongoose.model(modelName, Token);
module.exports = model;