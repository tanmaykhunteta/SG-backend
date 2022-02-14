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
