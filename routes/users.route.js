const userController = require('../controllers/users.controller')

exports.routes = (app) => {
    app.post('/users/register', userController.register);
    app.post('/users/login', userController.login);
    app.put('/users/verify-email', userController.verifyEmail);
}

