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
 * @returns {Transaction} Promise if no callback passed
 */
Transaction.statics.findByID = async (id, fields=null) => {
    const cond = {_id}
    fields = fields || {}
    const collection = mongoose.model(modelName)
    return await collection.findOne(cond, fields)
} 



Transaction.statics.signedUp = async function(userDetails) {
    const doc = {
        pid : userDetails._id,
        txn_type: constants.TRANS_TYPES['signed_up'],
        reward : constants.REWARD_TYPES['signed_up'],
        txn_st : constants.TRANS_ST['completed'],
    };

    const savedDoc = await mongoose.model(modelName).create(doc)
    return savedDoc;
}


Transaction.statics.emailVerified = async function(userDetails) {
    const doc = {
        pid : userDetails._id,
        txn_type: constants.TRANS_TYPES['email_verified'],
        reward : constants.REWARD_TYPES['email_verified'],
        txn_st : constants.TRANS_ST['completed'],
    };

    const savedDoc = await mongoose.model(modelName).create(doc)
    return savedDoc
}




const model = mongoose.model(modelName, Transaction);
module.exports = model;