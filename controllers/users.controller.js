const UserDB = require('../models/user.model');
const TokenDB = require("../models/token.model")
const TransactionDb = require('../models/transactions.model');
const Async = require('async');
const utils = require('../utils/utils')
const bcrypt = require('bcrypt')
const mailer = require('../config/mailer');
const config = require('../config/config');
const constants = require('../config/constant')

exports.getUserSessionDetails = function(req, res, next) {
    utils.createResponse(req, res, 200, true, "user session found", req.user);
}

exports.register = function(req, res, next) {
    let body = utils.bulkLower(req.body, {only : "fn ln email cntry gndr"})
    body = utils.bulkTrim(body)

    Async.waterfall([
        function(cb){
            UserDB.findUserByEmail(body.email, "_id", (err, existingUser) => {
                if(err) return cb(err, null);
                cb(null, existingUser);
            })
        },

        function(existingUser, cb) {
            if(existingUser) {
                utils.createResponse(req, res, 200, false, "User already exists", null, constants.ERR_C.userAlExists)
                return cb(utils.createError("user already exists", true))
            }
            
            bcrypt.hash(body.pswd, 10, (err, hashedPswd) => {
                if(err || !hashedPswd) return cb(err);

                return cb(null, hashedPswd)
            })
        },

        function(hashedPswd, cb) {
            const {cnfm_pswd, ...dataToSave} = {...body, pswd : hashedPswd};
            const user = new UserDB(dataToSave)
            user.save((err, doc)=> {
                if(err) return cb(err);
                if(!doc) return cb(utils.createError("Error occured while saving user"), null);
                

                utils.createAuthData(doc, (err, auth) => {
                    //in cases of error auth.user will not be present so user won't be signed in but still be registered
                    if(!err && auth?.jwt) {
                        res.setHeader(config.ACC_TKN_HDR, auth.jwt)
                    }

                    utils.createResponse(req, res, 202, true, "registered", {auth: auth?.user})
                    cb(null, doc);
                })
            })
        }, 
    
        function(userDoc, cb) {
            TransactionDb.signedUp(userDoc);

            userDoc.ip = utils.remoteIp(req);
            TokenDB.newEmailVerification(userDoc, null, (err, doc) => {
                console.log(err)
                if(err) return cb(utils.createError(err, true));
                
                mailer.emailVerification(body.email, body.fn, token)
                cb(null)  
            })
        },
    ], 

    function(error, result) {
        console.log('heell')
        if(error && !error.handled) {
            next(error, req, res, next)
        }
    })
}


exports.login = async function(req, res, next) {
    const body = req.body;
    try {
        // Get user input
        const { email, pswd } = req.body;
    
        // Validate if user exist in our database
        const user = await UserDB.findOne({ email : email.toLowerCase() });
    
        if (user && (await bcrypt.compare(pswd, user.pswd))) {
          // Create token
          const auth = await utils.createAuthData(user);
    
          // user
            res.setHeader(config.ACC_TKN_HDR, auth.jwt);
            return utils.createResponse(req, res, 200, true, "Logged In", {auth: auth.user});
        }
        return utils.createResponse(req, res, 400, false, "Invalid Credentials")
      } catch (err) {
        next(err);
      }
}



exports.verifyEmail = function(req, res, next) {
    const token = req.body.token;
    Async.waterfall([
        function(cb) {
            TokenDB.findByToken(token, null, (err, tokenData) => {
                if(err) {
                    return cb(err);
                }    
                if(!tokenData) {
                    utils.createResponse(req, res, 200, false, "Token might have expired", null, constants.ERR_C.tokenExpired)
                    return cb(utils.createError('token expired', true));
                }
                cb(null, tokenData);
            })
        }, 

        function(tokenData, cb) { 
            UserDB.verifyEmail(tokenData, (err, user) => {
                if(err) {
                    return cb(err, null);
                }
                if(!user) {
                    const message = "Email is already verified! Please sign in";
                    utils.createResponse(req, res, 200, false, message, null, constants.ERR_C.emailAlVerified);
                    return cb(utils.createError(message, true))
                }
                cb(null, user);
            })
        },

        function(user, cb) {
            TokenDB.expireEMVToken(token, (err, data) => {
                if(err) cb(utils.createError(err, true), null)
                
                if(!data)  cb(utils.createError('Expire Token Failed', true))
                
                cb(null, null);
            });

            utils.createAuthData(user, (err, auth) => {
                if(err) { // if err, user will not be automatically signed in but rest will work successfully.
                   return utils.createResponse(req, res, 200, true, "email is verified", null);
                }

                res.setHeader(config.ACC_TKN_HDR, auth.jwt)
                utils.createResponse(req, res, 200, true, "Email is verified", {auth : auth?.user})
            })
        },
    ], function(err, result) {
        if(err && !err.handled) {
            next(err, req, res, next);
        }
    })
}
