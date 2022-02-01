var createError = require('http-errors');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var logger = require('morgan');
const passport = require('passport');
const cors = require('cors');
const config = require('./config/config');
const { applyPassportStrategies } = require('./middlewares/passport.strategies');


var app = express();

mongoose.connect(config.DB.URL).then(() => {
  	console.log("connected to mongoose")
}).catch((error)=>{
  	console.log('MongoDB connection error:', error);
})

app.use(cors({
	origin : 'http://localhost:4200',
	credentials : true,
	exposedHeaders : [config.ACC_TKN_HDR]
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


applyPassportStrategies(passport);


(require('./routes/users.route')).routes(app);
// var indexRouter = require('./routes/index');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  	next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	console.log(err);
	res.status(err.status || 500);
	res.send(err);
});


process.on('uncaughtException', uncaughtExceptionHandler = (err) => {
	console.log(`Caught exception: ${JSON.stringify(err)}, ${err}`);
	console.error('%s: %s %s', err.statusCode, err.message, err.stack);
});

 
module.exports = app;
