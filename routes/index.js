exports.initiateRoutes = (app) => {
  console.log("------------- building routes ------------");

  (require('./countries.route')).routes(app);
  (require('./users.route')).routes(app);
}

