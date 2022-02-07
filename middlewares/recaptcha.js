const fetch = require('isomorphic-fetch');
const utils = require('../utils/utils.js');
const constants = require('../config/constant');


exports.Validate = function(req,res,next) {
	if(process.env.NODE_ENV == 'test' || process.env.NODE_ENV == "development"){
		delete req.body['reCaptcha'];
		return next()
	}
	
	let token = req.body['reCaptcha'];
    const secretKey = process.env.recaptcha_secret_key;
	if(!secretKey) return utils.createResponse(req, res, 500, false, constants.ERR.internalError, null, constants.ERR_C['internalError'])
    const url =  `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}&remoteip=${req.connection.remoteAddress}`;
    
    fetch(url, {
        method: "post",
    })
    .then((response) => response.json())
    .then((google_response) => {
		if (google_response.success == true) {
			delete req.body['reCaptcha'];
			return next();
		} else {
			return utils.createResponse(req, res, 400, false, "recaptcha failed", null, constants.ERR_C['reCaptchaFailed']);
		}
	})
	.catch((error) => {
		return utils.createResponse(req, res, 500, false, constants.ERR.internalError, null, constants.ERR_C['internalError']);
	})
}