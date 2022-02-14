const UserDB = require('../models/user.model');
const TokenDB = require("../models/token.model")
const TransactionDb = require('../models/transactions.model');
const Async = require('async');
const utils = require('../utils/utils')
const bcrypt = require('bcrypt')
const mailer = require('../config/mailer');
const config = require('../config/config');
const constants = require('../config/constant');
const { carefully } = require('../utils/utils');


exports.getUserSessionDetails = function(req, res, next) {
    delete req.user.iat;
    delete req.user.exp;
    utils.createResponse(req, res, 200, true, "user session found", req.user);
}



exports.register = async function(req, res, next) {
    let body = utils.bulkLower(req.body, {only : "fn ln email cntry gndr"})
    body = utils.bulkTrim(body)
    
    try {
        const existingUser = await UserDB.findUserByEmail(body.email, "_id");
        if(existingUser) 
            return utils.createResponse(req, res, 409, false, constants.ERR_C.userAlExists, null, constants.ERR_C.userAlExists)    
            
            
        let hashedPswd = await bcrypt.hash(body.pswd, 10)
        if(!hashedPswd)
            return next(utils.createError('unable to hash password'));
        
        const {cnfm_pswd, ...dataToSave} = {...body, pswd : hashedPswd};
        const user = new UserDB(dataToSave)

        const transaction = await TransactionDb.signedUp(user)
        if(!transaction)
            return next(utils.createError("some error occured while signing up"));

        const [saveErr, userDoc] = await carefully(user.save())
        if(!userDoc || saveErr) 
            return next(utils.createError("some error occured while signing up"));


        const [authErr, auth] = await carefully(utils.createAuthData(userDoc))
        if(auth) 
            res.setHeader(config.ACC_TKN_HDR, auth.jwt)
        utils.createResponse(req, res, 202, true, "registered", {auth: auth?.user})


        userDoc.ip = utils.remoteIp(req);
        const [tokenErr, token] = await carefully(TokenDB.newEmailVerification(userDoc, null));
        if(token) 
            mailer.emailVerification(body.email, body.fn, token)
    } catch (error) {
        next(error);   
    }
}



exports.login = async function(req, res, next) {
    const body = req.body;
    try {
        const { email, pswd } = req.body;
    
        const user = await UserDB.findOne({ email : email.toLowerCase() });
    
        if (user && (await bcrypt.compare(pswd, user.pswd))) {
            const auth = await utils.createAuthData(user);
    
            res.setHeader(config.ACC_TKN_HDR, auth.jwt);
            return utils.createResponse(req, res, 200, true, "Logged In", {auth: auth?.user});
        }

        return utils.createResponse(req, res, 400, false, "Invalid Credentials")
    } catch (err) {
        next(err);
    }
}



exports.verifyEmail = async function(req, res, next) {
    try {
        const token = req.body.token;
        const tokenData = await TokenDB.findByToken(token, null);
        if(!tokenData) 
            return utils.createResponse(req, res, 422, false, constants.ERR.tokenExpired, null, constants.ERR_C.tokenExpired)
        

        const user = await UserDB.verifyEmail(tokenData)
        if(!user)
            return utils.createResponse(req, res, 409, false, constants.ERR.emAlVerified, null, constants.ERR_C.emAlVerified);
        
            
        const transEmVerified = await TransactionDb.emailVerified(user);
        if(!transEmVerified) 
            return next(utils.createError("There was a problem in verifying email"))

        const [authErr, auth] = await carefully(utils.createAuthData(user))
        if(auth)
            res.setHeader(config.ACC_TKN_HDR, auth.jwt)
        utils.createResponse(req, res, 200, true, "Email is verified", {auth : auth?.user})
        
        
        const [tknDelErr, tknDel] = await carefully(TokenDB.expireEMVToken(token));
        if(!tknDel) 
            return next(utils.createError('Couldn\'t expire token', true))
    } catch(error) {
        return next(error);
    }
}


exports.reqResetPswd = function(req, res, next) {
    
    let body = utils.bulkLower(req.body, {only : "email"})
    body = utils.bulkTrim(body)

    Async.waterfall([
        function(cb){
            UserDB.findUserByEmail(body.email, "_id fn role", (err, existingUser) => {
                if(err) return cb(err, null);
                cb(null, existingUser);
            })
        },

        function(existingUser, cb) {
            
            if(!existingUser) {
                utils.createResponse(req, res, 200, false, "User does not exists", null, constants.ERR_C.userNoExists)
                return cb(utils.createError("user does not exists", true))
            }
            body.role = existingUser.role;
            body.ip = utils.remoteIp(req);
            body.fn = existingUser.fn;
            TokenDB.newPasswordReset(body,null, (err,token) =>{
                if(err) return cb(utils.createError(err, true));

                console.log(body.fn);
                mailer.resetPswd(body.email, body.fn, token.tkn)
                cb(null)

            })
            
            
            
        },
    ], 

    function(error, result) {
        console.log(error);
        if(error && !error.handled) {
            next(error, req, res, next)
        }
    })
}

exports.verifyToken = function(req,res,next){
    const token = req.body.token;
    TokenDB.findByToken(token, null, (err, tokenData) => {
        if(err) {
            return err;
        }    
        if(!tokenData || tokenData.expired) {
           return utils.createResponse(req, res, 200, false, "Token might have expired", null, constants.ERR_C.tokenExpired);
        }
        return utils.createResponse(req,res,200,true,"success");
    })
}


exports.resetPassword = function(req, res, next){
    const token = req.body.token;
    Async.waterfall([
        function(cb) {
            TokenDB.findByToken(token, null, (err, tokenData) => {
                if(err) {
                    return cb(err);
                }    
                if(!tokenData || tokenData.expired) {
                    utils.createResponse(req, res, 200, false, "Token might have expired", null, constants.ERR_C.tokenExpired)
                    return cb(utils.createError('token expired', true));
                }
                bcrypt.hash(req.body.pswd, 10, (err, hashedPswd) => {
                    if(err || !hashedPswd) return cb(err);
    
                    tokenData.pswd = hashedPswd;
                    console.log(tokenData.pswd);
                    cb(null, tokenData);
                })
                
            })
        }, 

        function(tokenData, cb) { 
            UserDB.resetPswd(tokenData, (err, user) => {
                if(err) {
                    return cb(err, null);
                }
                utils.createResponse(req, res, 200, true, "Password changed succesfully", null)
                cb(null, null);
            })
        },

    ], function(err, result) {
        if(err && !err.handled) {
            next(err, req, res, next);
        }
    })
} 
