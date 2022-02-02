const config = require('../config/config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

module.exports = {

    createAuthData : function(details, cb=null) {
        const tokenData = { _id: details._id, email : details.email, fn: details.fn, ln: details.ln, em_verified: details.em_verified }
        if(cb && typeof cb == "function") {
            module.exports.encodeJWT(tokenData, null, (err, token) => {cb(err, {user: tokenData, jwt: token})});
        } else {
            return new Promise((res, rej) => {
                module.exports.encodeJWT(tokenData, null, (err, token) => {
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
            jwt.sign(payload, "secret101", extraOptions, callback)
        } else {
            return new Promise((res, rej)=> {
                jwt.sign(payload, "secret101", extraOptions, (err, token)=>{
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
        }).end()
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
        return new Promise((res, rej) => {
            crypto.randomBytes(length, (err, buffer) => {
                if(err && !cb)
                    return rej(err);

                if(cb && typeof cb == "function") 
                    cb(err, buffer.toString(stringType));

                res(buffer.toString(stringType))
            })
        })
    },

    remoteIp : function(req) {
        let IP = null;
        if(req.headers['x-forwarded-for']) {
            IP = req.headers['x-forwarded-for'].split(',').shift()
        } else {
            IP = req.socket.remoteAddress
        }
        console.log("req ip " + IP);
        return IP
    },


    createError(error=null, handled=false) {
        if(error instanceof Object) {
            error.handled = handled;
            return error;
        } else {
            errorObj = new Error()
            errorObj.message = error
            errorObj.handled = handled
            return errorObj;
        }

    }
}