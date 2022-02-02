const userController = require('../controllers/users.controller')
const userValidation = require('./../Validation/user.validation');

exports.routes = (app) => {
    app.post('/users/register',userController.register);
    app.post('/users/login', userController.login);
    app.put('/users/verify-email', userController.verifyEmail);
    app.post('/users/recaptcha', userController.recaptcha);
}

