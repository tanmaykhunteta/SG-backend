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
    delete req.user.iat;
    delete req.user.exp;
    utils.createResponse(req, res, 200, true, "user session found", req.user);
}



exports.register = async function(req, res, next) {
    let body = utils.bulkLower(req.body, {only : "fn ln email cntry gndr"})
    body = utils.bulkTrim(body)
    
    let hashedPswd;
    try {
        const existingUser = await UserDB.findUserByEmail(body.email, "_id");
        if(existingUser) 
            return utils.createResponse(req, res, 409, false, constants.ERR_C.userAlExists, null, constants.ERR_C.userAlExists)    
        
    } catch(error) {
        return next(error);
    }
        
    hashedPswd = await bcrypt.hash(body.pswd, 10).catch((error) => null)
    if(!hashedPswd)
        return next(utils.createError('unable to save password'));
    
    let userDoc;
    try {
        const {cnfm_pswd, ...dataToSave} = {...body, pswd : hashedPswd};
        const user = new UserDB(dataToSave)
        userDoc = await user.save()
        if(!userDoc) 
            return next(utils.createError("Could not sign up"));
    } catch(error) {
        return next(utils.createError("Error occured while saving user"));
    }
    

    const auth = await utils.createAuthData(userDoc).catch((error) => null)
    if(auth) 
        res.setHeader(config.ACC_TKN_HDR, auth.jwt)
    utils.createResponse(req, res, 202, true, "registered", {auth: auth?.user})


    TransactionDb.signedUp(userDoc)
    .catch((err) => next(utils.createError(err, true)));
    

    userDoc.ip = utils.remoteIp(req);
    TokenDB.newEmailVerification(userDoc, null)
    .then((token) => {
        if(token)
            mailer.emailVerification(body.email, body.fn, token)
    })
    .catch((error) => next(utils.createError(error, true)))
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
    

        const auth = await utils.createAuthData(user).catch((err) => null)
        if(auth)
            res.setHeader(config.ACC_TKN_HDR, auth.jwt)
        utils.createResponse(req, res, 200, true, "Email is verified", {auth : auth?.user})
        
        
        TokenDB.expireEMVToken(token)
        .then((doc) => {
            if(!doc) 
                return next(utils.createError('Couldn\'t expire token', true))
        })
        .catch((error) => next(utils.createError(error, true)))

        TransactionDb.emailVerified(user)
        .then((doc) => {
            if(!doc) 
                return next(utils.createError("Couldn't add verify email transaction", true))
        })
        .catch((error) => {
            return next(utils.createError(error, true));
        })
    } catch(error) {
        return next(error);
    }
}
