const userController = require('../controllers/users.controller')
const reCaptcha = require('../middlewares/recaptcha')
const passport = require('passport');
const { validate } = require('../middlewares/validator');

exports.routes = (app) => { 
    const userValidate = validate.bind(null, 'user.schema.json'); // bind user validatorSchema identifier to validate method.
    
    app.get('/users/session-details', passport.authenticate('jwt', {session: false}), userController.getUserSessionDetails);
    app.post('/users/register', reCaptcha.Validate, userValidate('register'), userController.register);
    app.post('/users/login', reCaptcha.Validate, userValidate('login'), userController.login);
    app.put('/users/verify-email', userController.verifyEmail);
}
