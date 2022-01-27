const passportJWT = require('passport-jwt');
const config = require('../config/config');

exports.applyPassportStrategies = passport => {
    const options = {};
    options.jwtFromRequest = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken();
    options.secretOrKey = config.JWT_CONFIG.SECRET;
    passport.use(
        new passportJWT.Strategy(options, (payload, done) => {
        console.log(payload);
        done(error, payload)
        })
    );
};
