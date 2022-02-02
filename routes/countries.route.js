const countriesController = require('../controllers/countries.controller');

exports.routes = (app) => {
    app.get('/countries', countriesController.getCountriesAll);
}

