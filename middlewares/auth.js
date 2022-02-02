const passport = require('passport')
const utils = require('../utils/utils')

exports.checkAuthentication = function(req, res, next) {
    
    passport.authenticate('jwt', {session: false}, (err, userDetail)=>{
        console.log('hell')
        if(err || !userDetail) {
            return utils.createResponse(req, res, 401, false, "sorry you need to sign in again");
        }

        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }           // generate a signed son web token with the contents of user object and return it in the response           const token = jwt.sign(user, 'your_jwt_secret');
            return res.json({user, token});
        });
        req.user = userDetail;
        next();
    })
}