const config = require('../config/config');
const constants = require('../config/constant')
const mongoose = require('mongoose');
const utils = require('../utils/utils');
const Async = require('async');
const Schema = mongoose.Schema;
const modelName = "tokens"


const Token = new Schema({ 
    tkn : {type : String, unique : true},
    email : {type : String, index:true, required: true},
    role : {type: String, enum : constants.ROLES.values, required: true},
    type : {type: String, enum : constants.TOKEN_TYPES.values},
    rqtIP : String,
    expired : {type: Boolean, default: false},
    // createdAt : {type: Date,default: Date.now(),index:true,expires: 10}
}, {
    timestamps : true
})

// Token.index('createdAt', {expireAfterSeconds : 10});


/**
 * returns an Token doc searched by token and type
 * 
 * @param {string} token
 * @param {string | Object} fields (optional) space separated field string or object
 * @returns {string} returns Promise if no callback passe
 */
Token.statics.findByToken = async (token, fields=null) => {
    const cond = {tkn: token, createdAt:{$gt:Date.now()-60*1000}, expired:false};
    fields = fields || {}
    const collection = mongoose.model(modelName)
    return await collection.findOne(cond, fields)
} 


/**
 * insert new token data to Token collection
 * 
 * @param {Object} details details : email, role, requesterIp
 * @param {String} token unique token to verify user, generates token, if no token provided 
 * @returns {string} token
 */
Token.statics.newEmailVerification = async(details, token=null) => {
    const collection = mongoose.model(modelName);
    await collection.deleteExistingToken(details.email, details.role, constants.TOKEN_TYPES.EMV)

    if(!token || typeof token != 'string') {
        token = await utils.generateRandomToken(48, 'hex')
        if(!token) 
            throw new Error("error in generating cb")
    }
    
    const body = {tkn: token, email : details.email, role : details.role, type: constants.TOKEN_TYPES.EMV, ip: details.ip}
    const tokenData = new model(body);
    const doc = await tokenData.save()
    if(!doc) 
        throw new Error("could not save token");

    return doc.tkn
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
    // cb = utils.isCb(cb);
    return new Promise((res, rej)=>{
        const collection = mongoose.model(modelName);
        Async.waterfall([
            function(cb1) {
                collection.deleteExistingToken(details.email, details.role, constants.TOKEN_TYPES.PSR)
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
                const body = {tkn: token, email : details.email, role : details.role, type: constants.TOKEN_TYPES.PSR, ip: details.ip}
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
            if(err && !cb) return rej(err)

            if(cb) cb(err, result);
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
Token.statics.deleteExistingToken = (email, role, type) => {
    const cond = {email, role, type};
    const collection = mongoose.model(modelName)

    const update = {$set: {expired: true}};
    
    return collection.updateMany(cond, update);
}


Token.statics.expireEMVToken = async(token) => {
    const cond = {tkn : token};
    const collection = mongoose.model(modelName);
    return await collection.deleteOne(cond);
}



const model = mongoose.model(modelName, Token);
module.exports = model;