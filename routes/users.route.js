const userController = require('../controllers/users.controller')
const auth = require('../middlewares/auth')
const passport = require('passport');

exports.routes = (app) => {
    app.get('/users/session-details', passport.authenticate('jwt', {session: false}), userController.getUserSessionDetails);
    app.post('/users/register', userController.register);
    app.post('/users/login', userController.login);
    app.put('/users/verify-email', userController.verifyEmail);
}

