var express = require('express');

exports.initiateRoutes = (app) => {
  console.count("routes initiated");
  (require('./countries.route')).routes(app);
  (require('./users.route')).routes(app);
}

