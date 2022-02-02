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


exports.login = async function(req, res, next) {
    const body = req.body;
    try {
        // Get user input
        const { email, pswd } = req.body;
    
        // Validate if user exist in our database
        const user = await UserDB.findOne({ email });
    
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

    const cond = {tkn : token, type : config.TOKEN_TYPES.EMV};
    TokenDB.findOneAndDelete(cond, {rawResult : true}) 
    .then((tokenData) => { //return {lastErrorObject : {}, value}
        if(!tokenData.lastErrorObject.n) 
            return utils.createResponse(req, res, 200, false, "Token might have expired")

        tokenData = tokenData.value;  
        const cond = {email: tokenData.email, role: tokenData.role, em_verified : false}
        const update = {$set : {em_verified : true, em_verified_on: new Date()}}
        UserDB.findOneAndUpdate(cond, update, {rawResult : true})
        .then((user) => {
            if(!user.lastErrorObject.n) 
                return utils.createResponse(req, res, 200, false, "Email is already verified!");
            
            utils.createAuthData(user)
            .then((auth) => {
                res.setHeader(config.ACC_TKN_HDR, auth.jwt)
                return utils.createResponse(req, res, 200, true, "Email is verified", auth.user)
            })
            .catch((error) => {
                return next(error);
            })
        })
        .catch((error) => {
            next(error);
        })
    })
    .catch((error) => {
        return next(error);
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