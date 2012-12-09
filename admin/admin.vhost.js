var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express()
	,util = require('util')
	,chronicle = require('chronicle')
	,MemcachedStore = require('connect-memcached')(express)
	,RedisStore = require('connect-redis')(express)
; 


/******************************************************************************
********* Set up basic response middleware
******************************************************************************/
server.use(require('../lib/responseTime')()); //accurate response time
server.use(express.responseTime());

//Fuck caching.
server.use(function(req, res, next) {
	res.on('header', function() {
		res.setHeader('Cache-Control', 'max-age=0, no-store, private');
	});
	next();
});

//Basic configuration
server.use(express.favicon()); //Serve before logging so it does not get logged

//Logger is kind of two parts
server.use(function(req, res, next) { req.vhost_for_logger = 'ADMIN'; next(); });
server.use(express.logger({format: 'mydev'}));

server.use(express.cookieParser()); //Can take a secret to encrypt them
server.use(express.session({
	 secret: 'F5fasdfasd&*^3G7hutR'
	,key: 'admin_sid'
	,store: new RedisStore({port: app.config.redis.port, host: app.config.redis.address, pass: app.config.redis.pass, prefix: 'ases'})
	,cookie: { maxAge: 1000 * 60 * 60 * 3 }
})); //,cookie: {maxAge: 60 * 60 * 24 * 1000}}

server.use(require('../lib/poweredBy')); //Overwrite the x-powered-by header

server.use(express.bodyParser()); // parse request bodies (req.body)
server.use(express.methodOverride('action')); // support _method input element (PUT in forms etc)


/******************************************************************************
********* Set up the view engine
******************************************************************************/
server.set('view engine', 'jade');
server.set('views', app.config.root + app.config.admin_dir + '/views');
app.config.cache_views ? server.enable('view cache') : server.disable('view cache');

//helper functions for the views
server.locals({
	 chronicle: chronicle.chronicle //helper to add version path to static urls
	,dateFormat: require('dateformat') //helper for date\time formatting
});


/******************************************************************************
********* Set up res.err() and res.msg() stuff
******************************************************************************/
server.response.err = function(msg) {
	if (!msg || msg.length == 0) return;
	
	var sess = this.req.session;
	sess.flash_errs = sess.flash_errs || [];
	sess.flash_errs.push(msg);
	return this;
};

server.response.err_count = function() {
	return (this.req.session.flash_errs || []).length;
}

// define a custom res.message() method
server.response.msg = function(msg) {
	if (!msg || msg.length == 0) return; 
	
	var sess = this.req.session;
	sess.flash_msgs = sess.flash_msgs || [];
	sess.flash_msgs.push(msg);
	return this;
};

//Add a function to locals that does this. then in the template do "for flash_msgs()"

/*
// expose the "messages" local variable when views are rendered
server.locals.use(function(req, res) {
	res.locals.flash_errs = req.session.flash_errs || [];
	delete req.session.flash_errs;
	
	res.locals.flash_msgs = req.session.flash_msgs || [];
	delete req.session.flash_msgs;
	
	//console.log('Setting up flash messages.');
});
*/



server.viewCallbacks.push(function() {
	console.log('hrm');
});

/******************************************************************************
********* Set up the form validator
******************************************************************************/
server.use(require('express-validator'));

server.use(function(req, res, next) {
	req.onValidationError(function (msg) {
		res.err(msg);
	});
	
	next();
});


/******************************************************************************
********* Set up res.locals.config 
********* ...its all stuff needed on every page
******************************************************************************/
server.use(function(req, res, next) {
	console.log('CONFIG');

	res.locals.config = {};
	
	//res.locals.config should consist of things set for every page, making config a reserved global
	res.locals.config.logged_in = req.session.logged_in;//req.session.logged_in;
	
	res.locals.config.site_name = app.config.site_name;
	res.locals.config.static_url = app.config.static_url.slice(0);
	res.locals.config.css_files = app.config.local_css_files.slice(0);
	res.locals.config.js_files = app.config.local_js_files.slice(0);
	res.locals.config.NODE_ENV = process.env.NODE_ENV;
	
	res.locals.breadcrumbs = [];
	
	res.locals.flash_errs = function() {
		var data = req.session.flash_errs || [];
		delete req.session.flash_errs;
		
		return data;
	};
	
	res.locals.flash_msgs = function() {
		var data = req.session.flash_msgs || [];
		delete req.session.flash_msgs;
		
		return data;
	};
	
	console.log('--CONFIG');
	
	next();
});


/******************************************************************************
********* Add vhost to express
******************************************************************************/
app.express.use(express.vhost('*' + app.config.domains.admin, server))


/******************************************************************************
********* Add the router, it should be the last thing before the routes
******************************************************************************/
server.use(server.router);


var chat;

/******************************************************************************
********* Load the routes and controllers
********* This is in a function so that the vhosts router can be set up
********* before the controllers try to use it.
******************************************************************************/
module.exports.boot = function(io) {
	chat = io
	  .of('/admin')
	  .on('connection', function (socket) {
		socket.emit('a message', {
			that: 'only'
		  , '/chat': 'will get'
		});
		chat.emit('a message', {
			everyone: 'in'
		  , '/chat': 'will get'
		});
	});
	
	
	/******************************************************************************
	********* Load up the controllers
	********* ...should probably automate this somehow
	******************************************************************************/
	require('./controllers/index');
	require('./controllers/main');
	require('./controllers/purge');
	require('./controllers/users');
	require('./controllers/twitter');
	require('./controllers/crons');
	
	require('./controllers/aws/sns');
	
	/******************************************************************************
	********* Error handling middleware, 
	********* ...doesn't seem to working right now
	******************************************************************************/
	server.use(function(err, req, res, next) {
		res.locals.err = err;
		res.locals.inspect_text = JSON.stringify(err, null, '    '); //util.inspect(err, true, 5);
		res.status(500).render('errors/500');
		
		console.error(err);
	});
	
	/******************************************************************************
	********* If nothing has responded by now, its a 404
	******************************************************************************/
	server.all('*', function(req, res, next) {
		res.locals.url = req.url;
		res.status(404).render('errors/404');
	});
}

