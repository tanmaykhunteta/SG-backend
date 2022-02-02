const UserDB = require('../models/user.model');
const TokenDB = require("../models/token.model")
const Async = require('async');
const utils = require('../utils/utils')
const bcrypt = require('bcrypt')
const mailer = require('../config/mailer');
const config = require('../config/config');
const constant = require('../config/constant')
const passport = require('passport');

exports.getUserSessionDetails = function(req, res, next) {

    utils.createResponse(req, res, 200, true, "user session found", req.user);
}

exports.register = function(req, res, next) {
    const body = req.body;
    body.email = body.email.toLowerCase()
    Async.waterfall([
        function(cb){
            UserDB.findUserByEmail(body.email, "_id", (err, existingUser) => {
                if(err) return cb(err, null);
                cb(null, existingUser);
            })
        },

        function(existingUser, cb) {
            if(existingUser) {
                console.log("dasfsdfdsd")
                utils.createResponse(req, res, 200, false, "User already exists")
                return cb(utils.createError("user already exists", true))
            }

            bcrypt.hash(body.pswd, 10, (err, hashedPswd) => {
                if(err || !hashedPswd) 
                    return cb(error);
                else 
                    return cb(null, hashedPswd)
            })
        },

        function(hashedPswd, cb) {
            const dataToSave = {...body, pswd : hashedPswd, cnfm_pswd: undefined};
            console.log(dataToSave)
            const user = new UserDB(dataToSave)
            user.save((err, doc)=> {
                console.log(doc)
                if(err) {
                    return cb(err);
                }
                if(!doc) {
                    return cb("Error occured while saving user", null);
                }

                utils.createAuthData(doc, (err, auth) => {
                    if(!err && auth?.jwt) {
                        res.setHeader(config.ACC_TKN_HDR, auth.jwt)
                    }

                    utils.createResponse(req, res, 202, true, "registered", auth?.user)
                    cb(null, doc);
                })
            })
        },

        function(userDoc, cb) {
            userDoc.ip = utils.remoteIp(req);
            TokenDB.newEmailVerification(userDoc, null, (err, doc) => {
                if(err) 
                    cb(utils.createError(err, true));
                else 
                    cb(null, doc.tkn)
            })
        },

        function(token, cb) {
            mailer.emailVerification(body.email, body.fn, token)
            cb(null, null);
        }
    ], 

    function(error, result) {
        console.log(error);
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
            return utils.createResponse(req, res, 200, true, "Logged In", auth.user);
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
            TokenDB.findByToken(token, config.TOKEN_TYPES.EMV, null, (err, tokenData) => {
                if(err) {
                    return cb(err);
                }    
                if(!tokenData) {
                    utils.createResponse(req, res, 200, false, "Token might have expired", null, constant.ERROR_CODES.tokenExpired)
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
                    utils.createResponse(req, res, 200, false, message, null, constant.ERROR_CODES.emailAlVerified);
                    return cb(utils.createError(message, true))
                }
                cb(null, user);
            })
        },

        function(user, cb) {
            utils.createAuthData(user, (err, auth) => {
                if(err) { // if err, user will not be automatically signed in but rest will work successfully.
                    utils.createResponse(req, res, 200, true, "email is verified", null);
                    return cb(null);
                }

                res.setHeader(config.ACC_TKN_HDR, auth.jwt)
                utils.createResponse(req, res, 200, true, "Email is verified", auth.user)
                cb(null);
            })
        },

        function(cb) { // expire token
            TokenDB.expireToken(token, (err, data) => {
                if(err) {
                    cb(utils.createError(err, true), null)
                }
                if(!data) {
                    cb(utils.createError('Expire Token Failed', true))
                }
                cb(null, null);
            });
        }
    ], function(err, result) {
        console.log(err);
        if(err && !err.handled) {
            next(err, req, res, next);
        }
    })
}

exports.recaptcha = function(req,res,next) {
    let token = req.body.recaptcha;
    console.log(token);
    const secretKey = "6Ld60lEeAAAAAPxmx4YkrY1dPlv6eaf2JTd-fMuZ";
    const url =  `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}&remoteip=${req.connection.remoteAddress}`;
    if(token === null || token === undefined){
        res.status(201).send({success: false, message: "Token is empty or invalid"})
        return console.log("token empty");
      }
      
    request(url, function(err, response, body){
        //the body is the data that contains success message
        body = JSON.parse(body);
        
        //check if the validation failed
        if(body.success !== undefined && !data.success){
             res.send({success: false, 'message': "recaptcha failed"});
             return console.log("failed")
         }
        
        //if passed response success message to client
         res.send({"success": true, 'message': "recaptcha passed"});
        
      })

}