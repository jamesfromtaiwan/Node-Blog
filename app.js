var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
var TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

// Dependencies
var express 	= require('express'),
	http		= require('http'),
	routes 		= require('./routes'),
	path		= require('path'),
	mongoose 	= require('mongoose'),
	models 		= require('./models'),
	dbUrl		= process.env.MONGOHQ_URL || 'mongodb://127.0.0.1:27017/blog',
	db 			= mongoose.connect(dbUrl,{db: {native_parser: true}}),
	assert		= require('assert'),
	everyauth 	= require('everyauth');

// Database Connection
var dbConnect = mongoose.connection;
dbConnect.on('error', console.error.bind(console, 'connection error:'));
dbConnect.once('open', function() {
	console.log('DB Connected.');
});

// Express.js 4 middlewares 
var session = require('express-session'),
logger 		= require('morgan'),
errorHandler = require('errorhandler'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
methodOverride = require('method-override');


// EveryAuth Config Start
everyauth.debug = true;
everyauth.twitter
  .consumerKey(TWITTER_CONSUMER_KEY)
  .consumerSecret(TWITTER_CONSUMER_SECRET)
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    var promise = this.Promise();
    process.nextTick(function(){
        if (twitterUserMetadata.screen_name === 'JamesLo1994') {
          session.user = twitterUserMetadata;
          session.admin = true;
        }
        promise.fulfill(twitterUserMetadata);
    })
    return promise;
    // return twitterUserMetadata
  })
  .redirectPath('/admin');

//we need it because otherwise the session will be kept alive
//the Express.js request is intercepted by Everyauth automatically added /logout
//and never makes it to our /logout
everyauth.everymodule.handleLogout(routes.user.logout);

everyauth.everymodule.findUserById( function (user, callback) {
  callback(user)
});

// EveryAuth Config End

// Creating Express.js instance and assigning the title
var app = express();
app.locals.appTitle = 'blog-express';

// Middlewares that exposes Mongoose / MongoDB models in each Express.js route via req object
app.use(function (req, res, next) {
	if (!models.Article || !models.User) {
		return next(new Error('No models.'));
	}
	req.models = models;
	return next();
});

// Config
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Log requests, pasrse JSON input, use Stylus and server static content
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride('_method'));
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('my name is james and i am from Taiwan'));
app.use(session({secret: 'I have been to NZ and SF and they are awesome',
				resave: false,
				saveUninitialized: true,
				cookie: { secure: false }}));
app.use(everyauth.middleware());

// Authentication middleware
app.use(function (req, res, next) {
	if (req.session && req.session.admin) {
		res.locals.admin = true;
	}
	next();
});

// Authorization Middleware
var authorize = function (req, res, next) {
	if (req.session && req.session.admin) {
		return next();
	} else {
		console.log(req.session, req.session.admin);
		return res.sendStatus(401);
	}
}

// Error Handler for dev
if ('development' == app.get('env')) {
	app.use(errorHandler());
}

// Routes
// Pages and routes: render from html
app.get('/', routes.index);
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenticate);
app.get('/logout', routes.user.logout);
app.get('/admin', authorize, routes.article.admin);
app.get('/post', authorize, routes.article.post);
app.post('/post', authorize, routes.article.postArticle);
app.get('/articles/:slug', routes.article.show);

// REST API routes
app.all('/api', authorize);
app.get('/api/articles', routes.article.list);
app.post('/api/articles', routes.article.add);
app.put('/api/articles/:id', routes.article.edit);
app.delete('/api/articles/:id', routes.article.delete);



app.all('*', function(req, res) {
  res.sendStatus(404);
});

var server = http.createServer(app);
var boot = function () {
	server.listen(app.get('port'), function () {
		console.info('Express server listening on port ' + app.get('port'));
	});
};
var shutdown = function () {
	server.close();
};

if (require.main === module) {
	console.log('Running app as an entry');
	boot();
} else {

	console.log('Running app as a module');
	exports.boot = boot;
	exports.shutdown = shutdown;
	exports.port = app.get('port');

}

