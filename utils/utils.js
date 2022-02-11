const config = require('../config/config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const constants = require('../config/constant')

module.exports = {

    isCb : (cb) => {
        if(typeof cb == "function")
            return cb;
        return null;
    },


    createAuthData : async function(details) {
        const tokenData = { _id: details._id, email : details.email, fn: details.fn, ln: details.ln, em_verified: details.em_verified, ttl_reward : details.ttl_reward, type: constants.ROLES['USER'] }
        const token = await module.exports.encodeJWT(tokenData, null)
        const result = {user : tokenData, jwt : token};
        return result;
    },

    
    /**
     * encodes payload.
     * If no callback passed, it returns a promise 
     * 
     * @param {object} payload data to encode
     * @param {string} expiresIn  (optional) expiry time ex: '2m', '1h', etc. 
     * @returns {string} jwt token
     */
    encodeJWT : async function(payload, expiresIn=null) {
        const extraOptions = {expiresIn : expiresIn || config.JWT_CONFIG.EXPIRES_IN};
        return await jwt.sign(payload, config.JWT_CONFIG.SECRET, extraOptions)
    },



    createResponse : function(req, res, status, success, message, data = null, code=null) {
        const response = {
            status : status,
            method : req.method,
            api : req.url,
            success: success,
            message: message,
            data : data
        }
        if(code) response.code = code;
        return res.status(status).json(response).end()
    },


    /**
     * return promise if no callback passed.
     * @param {number} length length of buffer
     * @param {string} stringType 'hex', 'base64', etc.
     * @returns {string} token 
     */
    generateRandomToken : function(length, stringType) { 
        return new Promise((res, rej) => {
            crypto.randomBytes(length, (err, buffer) => {
                if(err) return rej(err);

                const token = buffer.toString(stringType)  
                res(token)
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



    createError : function(error=null, handled=false) {
        if(error instanceof Object) {
            error.handled = handled;
            return error;
        } else {
            errorObj = new Error()
            errorObj.message = error
            errorObj.handled = handled
            return errorObj;
        }
    },


    /**
     * converts keys of an object to lower (bulkManipulate wrapper) 
     * 
     * ref utils.js bulkManipulate for example
     * @param {object} dataObj 
     * @param {object} optionals {only? : string, all? : boolean, except? : string}
     * @returns dataObj with lowerCase values
     */
    bulkLower : function(dataObj, { only = "", all=false, except = ""} = {}) {
        return module.exports.bulkManipulate(dataObj, {only, all, except}, (value)=>{
            return (typeof value == "string") ? value.toLowerCase() : value;
        })
    },


    /**
     * trims string values of an object (bulkManipulate wrapper
     * 
     * refer utils.js bulkManipulate for example
     * @param {object} dataObj 
     * @param {object} optionals {only? : string, all? : boolean, except? : string}
     * @returns dataObj with trimmed values
     */
    bulkTrim : function(dataObj, { only = "", all=false, except = ""} = {}) {
        return module.exports.bulkManipulate(dataObj, {only, all, except}, (value)=>{
            return typeof value == "string" ? value.trim() : value;
        })
    },



    /** 
     * used by functions like bulkTrim, bulkLower etc.
     * @example
     * bulkManipulate({a : "A", b : "B", c : "C"}, {only: "a b"}, manipulatorCB) // only a and b are manipulated
     * 
     * bulkManipulate({a : "A", b : "B"}, {except: "b"}, manipulatorCB) // only a is manipulated
     * 
     * bulkManipulate({a : "A", b : "B", c: "C", d : "D"}, {all:true, except: "b"}, manipulatorCB) // b is not manipulated
     * 
     * @param { Function } cb callback function that return manipulated value.
     * @example manipulator cb format (value) => any 
     * bulkManipulate(dataObj, {all: true}, (value) => value.toLowerCase())
     * 
     * @return { object } manipulated dataObj
     */
    bulkManipulate : function(dataObj, { only = "", all=false, except = ""}, cb) {
        const obj = {...dataObj}
        if(only && all || only && except) 
            console.log('*all* and *except* are ignored when passed with *only*');
        
        all = !only ? true : false;
        if(only) {
            only.split(' ').map((key) => {
                obj[key] = cb(obj[key]);
            })
        }
        else if(all) {
            except = except.split();
            for(let key in obj) {
                if(except.indexOf(key) == -1)
                    obj[key] = cb(obj[key])
            }
        }
        return obj
    }
}