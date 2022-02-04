const userController = require('../controllers/users.controller')
const auth = require('../middlewares/auth')
const passport = require('passport');
const recaptcha = require('../middlewares/recaptcha');

exports.routes = (app) => {
    app.get('/users/session-details', passport.authenticate('jwt', {session: false}), userController.getUserSessionDetails);
    app.post('/users/register',recaptcha.Validate, userController.register);
    app.post('/users/login',recaptcha.Validate, userController.login);
    app.put('/users/verify-email', userController.verifyEmail);
    app.post('/users/recaptcha', userController.recaptcha);
}

