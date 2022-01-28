const UserDB = require('../models/user.model');
const TokenDB = require("../models/token.model")
const Async = require('async');
const utils = require('../utils/utils')
const bcrypt = require('bcrypt')
const mailer = require('../config/mailer');
const config = require('../config/config');

exports.register = function(req, res, next) {
    const body = req.body;
    Async.waterfall([
        function(cb){
            UserDB.findUserByEmail(body.email, "_id")
            .then((existingUser) => cb(null, existingUser))
            .catch((error) => cb(error, null))
        },

        function(existingUser, cb) {
            if(existingUser) {
                return utils.createResponse(req, res, 200, false, "User already exists")
            }

            bcrypt.hash(body.pswd, 10)
            .then((hashedPswd) => cb(null, hashedPswd))
            .catch((error) => cb(error))
        },

        function(hashedPswd, cb) {
            const dataToSave = {...body, pswd : hashedPswd, cnfm_pswd: undefined};
            const user = new UserDB(dataToSave)
            user.save()
            .then((doc) => {
                if(!doc) 
                    return cb("Error occured while saving user", null);
                utils.createResponse(req, res, 202, true, "registered")
                cb(null, doc);
            })
            .catch((error) => {
                next(error, req, res, next)
                cb(null, null)
            })
        },

        function(userDoc, cb) {
            TokenDB.newEmailVerification(userDoc)
            .then((doc)=>{
                cb(null, doc.tkn)
            })
            .catch((error) => {
                cb(error, null);
            })
        },

        function(token, cb) {
            mailer.emailVerification(body.email, body.fn, token)
            cb(null, null);
        }
    ], 

    function(error, result) {
        if(error) {
            console.log(error);
            return next(error, req, res, next);
        }
    })
}



exports.login = function(req, res, next) {

}



exports.verifyEmail = function(req, res, next) {
    const token = req.query.token;

    const cond = {tkn : token, type : config.TOKEN_TYPES.EMV};
    TokenDB.findOneAndDelete(cond, {rawResult : true}) 
    .then((tokenData) => { //return {lastErrorObject : {}, value}
        if(!tokenData.lastErrorObject.n) return res.redirect(config.FRONTEND + '/auth/email-verification-failed?message=token has been expired&status=false')

        tokenData = tokenData.value;  
        const cond = {email: tokenData.email, role: tokenData.role, em_verified : false}
        const update = {$set : {em_verified : true}}
        UserDB.findOneAndUpdate(cond, update, {rawResult : true})
        .then((user) => {
            if(!user.lastErrorObject.n) return res.redirect(config.FRONTEND + '/auth/email-verification-failed?message=email already verified&status=false');
            return res.redirect(config.FRONTEND + '/auth/login')
        })
        .catch((error) => {
            next(error);
        })
    })
    .catch((error) => {
        return next(error);
    })
}