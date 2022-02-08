const config = require('../config/config');
const constants = require('../config/constant');
const mongoose = require('mongoose');
const utils = require('../utils/utils');
const Async = require('async');
const User = require('./user.model');
const Schema = mongoose.Schema;
const modelName = "transactions"


const Transaction = new Schema({ 
    pid : {type : String, ref: 'users'}, // panelist id
    txn_type : {type : Number, enum : constants.TRANS_TYPES.values},
    txn_st : {type : Number, enum : constants.TRANS_ST.values},
    reward : {type : Number},
    srvy_id : {type : String},
}, {
    timestamps : true
})



/**
 * returns an transaction doc searched by _id
 * 
 * @param {String} token
 * @param {String | Object} fields (optional) space separated field string or object
 * @returns {Promise<Token>} returns Promise if no callback passed
 */
Transaction.statics.findByID = (id, fields=null, cb=null) => {
    const cond = {_id}
    fields = fields || {}
    const collection = mongoose.model(modelName)
    if(utils.isCb(cb))
        return collection.findOne(cond, fields, {}, cb)

    return collection.findOne(cond, fields)
} 



Transaction.statics.signedUp = function(userDetails, cb=null) {
    cb = utils.isCb(cb);
    new Promise((res, rej) => {
        const doc = {
            pid : userDetails._id,
            txn_type: constants.TRANS_TYPES['signed_up'],
            reward : constants.REWARD_TYPES['signed_up'],
            txn_st : constants.TRANS_ST['completed'],
        };

        mongoose.model(modelName).create(doc)
        .then((savedDoc) => {
            if(!savedDoc && !cb) 
                return rej(utils.createError('unable to create transaction'));
            
            if(cb) cb(null, savedDoc)
            res(savedDoc)
        })
        .catch((error) => {
            if(cb) cb(error, null);
            rej(error);
        })
    })
}


Transaction.statics.emailVerified = function(userDetails, cb=null) {
    cb = utils.isCb(cb);
    new Promise((res, rej) => {
        const doc = {
            pid : userDetails._id,
            txn_type: constants.TRANS_TYPES['email_verified'],
            reward : constants.REWARD_TYPES['email_verified'],
            txn_st : constants.TRANS_ST['completed'],
        };

        mongoose.model(modelName).create(doc)
        .then((savedDoc) => {
            if(!savedDoc && !cb) {
                return rej(utils.createError('unable to create transaction'));
            }
            
            if(cb) (null, savedDoc);
            res(savedDoc);
        })
        .catch((error) => {
            if(cb) cb(error);
            rej(error);
        })
    })
}




const model = mongoose.model(modelName, Transaction);
module.exports = model;