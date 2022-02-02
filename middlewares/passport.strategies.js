const passportJWT = require('passport-jwt');
const Strategy = require('passport-jwt').Strategy
const config = require('../config/config');

exports.applyPassportStrategies = passport => {
    passport.use(
        new Strategy({
            jwtFromRequest : (req) => {
                return req.headers[config.ACC_TKN_HDR]
            },
            secretOrKey : config.JWT_CONFIG.SECRET
        }, (payload, done) => {
            done(null, payload);
        })
    );
};
