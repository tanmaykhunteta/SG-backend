const userController = require('../controllers/users.controller')
const auth = require('../middlewares/auth')
const passport = require('passport');
const { validate } = require('../middlewares/validator');

exports.routes = (app) => { 
    const userValidate = validate.bind(null, 'user.schema.json'); // bind user validatorSchema identifier to validate method.
    
    app.get('/users/session-details', passport.authenticate('jwt', {session: false}), userController.getUserSessionDetails);
    app.post('/users/register', userValidate('register'), userController.register);
    app.post('/users/login', userValidate('login'), userController.login);
    app.put('/users/verify-email', userController.verifyEmail);
}
