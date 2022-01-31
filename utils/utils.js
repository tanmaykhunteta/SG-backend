const config = require('../config/config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

module.exports = {

    createAuthData : function(details, cb=null) {
        const tokenData = { user_id: details._id, email : details.email, fn: details.fn, ln: details.ln }
        if(cb && typeof cb == "function") {
            module.exports.encodeJWT(tokenData, null, (err, token) => {cb(err, {user: tokenData, jwt: token})});
        } else {
            return new Promise((res, rej) => {
                module.exports.encodeJWT(tokenData, (err, token) => {
                    if(err) 
                        return rej(err);
                    res({user : tokenData, jwt : token});
                })
            });
        }
    },

    
    /**
     * encodes payload.
     * If no callback passed, it returns a promise 
     * 
     * @param {Object} payload data to encode
     * @param {String} expiresIn  (optional) expiry time ex: '2m', '1h', etc. 
     * @param {Function} callback (optional) (err, token : string) => {your implementation}
     * @returns {Promise} Promise<token> return only when no callback is passed
     */
    encodeJWT : function(payload, expiresIn=null, callback=null) {
        const extraOptions = {expiresIn : expiresIn || config.JWT_CONFIG.EXPIRES_IN};
        if(callback && typeof callback == "function") {
            jwt.sign(payload, config.JWT_CONFIG.SECRET, extraOptions, callback)
        } else {
            return new Promise((res, rej)=> {
                jwt.sign(payload, config.JWT_CONFIG.SECRET, extraOptions, (err, token)=>{
                    if(err) 
                        rej(err);
                    else 
                        res(token);
                })
            })
        }
    },



    createResponse : function(req, res, status, success, message, data = null) {
        return res.status(status).json({
            status : status,
            method : req.method,
            api : req.url,
            success: success,
            message: message,
            data : data
        })
    },

    /**
     * return promise if no callback passed.
     * 
     * @param {Number} length length of buffer
     * @param {String} stringType 'hex', 'base64', etc.
     * @param {Function} cb (optional) (error, string) => void
     * @returns {Promise<String>} return Promise token/error only if no cb passed
     */
    generateRandomToken : function(length, stringType, cb=null) {
        if(cb && typeof cb == "function") 
            return crypto.randomBytes(length, (err, buffer)=>{
                cb(err, buffer.toString(stringType))
            })

        return new Promise((res, rej) => {
            crypto.randomBytes(length, (err, buffer) => {
                if(err) return rej(err);
                res(buffer.toString(stringType))
            })
        })
    }

}