const UserDB = require('../models/user.model');
const Async = require('async');
const utils = require('../utils/utils')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const mailer = require('../config/mailer');

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
                return utils.createResponse(req, res, 400, false, "User already exists")
            }

            bcrypt.hash(body.pswd, 10)
            .then((hashedPswd) => cb(null, hashedPswd))
            .catch((error) => cb(error))
        },

        function(hashedPswd, cb) {
            utils.generateRandomToken(48, 'hex')
            .then((token) => {
                const dataToSave = {...body, pswd : hashedPswd, tmp_tkn: token, cnfm_pswd: undefined};
                cb(null, dataToSave)
            }).catch((err)=> {
                cb(err, null);
            })    
        },

        function(dataToSave, cb) {
            const user = new UserDB(dataToSave)
            user.save()
            .then((doc) => {
                if(!doc) 
                    return cb("Error occured while saving user", null);
                utils.createResponse(req, res, 202, true, "registered")
                cb(null, doc.tmp_tkn);
            })
            .catch((error) => {
                next(error, req, res, next)
                cb(null, null)
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
