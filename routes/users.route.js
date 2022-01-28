var express = require('express');
const userController = require('../controllers/users.controller')

exports.routes = (app) => {
    app.get('/users/verify-email', userController.verifyEmail);
    app.post('/users/register', userController.register);
    app.post('/users/login', userController.login);
}

