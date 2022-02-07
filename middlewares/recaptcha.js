const fetch = require('isomorphic-fetch');
const utils = require('../utils/utils.js');
const constants = require('../config/constant');
exports.Validate = function(req,res,next) {
    let token = req.body['reCaptcha'];
    console.log(token);
    const secretKey = "6LdPK1MeAAAAAIEKwcQczoGZ6ExBZqJVfjvU4Hul";
    const url =  `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}&remoteip=${req.connection.remoteAddress}`;
    const name = req.body.name;
    
 
    // Making POST request to verify captcha
    fetch(url, {
        method: "post",
    })
    .then((response) => response.json())
    .then((google_response) => {
 
      // google_response is the object return by
      // google as a response
      if (google_response.success == true) {
        //   if captcha is verified
        return next();
      } else {
        // if captcha is not verified
        return utils.createResponse(req,res,400,false,"recaptcha failed",null,constants.ERROR_CODES.recaptchaFailed);
      }
    })
    .catch((error) => {
        // Some error while verify captcha
      return utils.createResponse(req,res,500,false,"some error occured");
    })}