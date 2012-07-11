var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer()
	,util = require('util')
	,versionator = require('../lib/versionator')(app.config.unique)
	,MemcachedStore = require('connect-memcached')(express)
	,mongoose = require('mongoose')
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
	 secret: 'F5fRU2rap3G7hutR'
	,key: 'sid'
	,store: new MemcachedStore 
})); //,cookie: {maxAge: 60 * 60 * 24 * 1000}}

server.use(require('../lib/poweredBy')); //Overwrite the x-powered-by header

server.use(express.bodyParser()); // parse request bodies (req.body)
server.use(express.methodOverride('action')); // support _method input element (PUT in forms etc)


/******************************************************************************
********* Set up the view engine
******************************************************************************/
server.set('view engine', 'jade');
server.set('views', app.config.root + app.config.admin_views_dir);
if (app.config.cache_views) server.enable('view cache');


server.locals({
	 versionPath: versionator.versionPath //helper to add version path to static urls
	,dateFormat: require('dateformat') //helper for date\time formatting
});

//Pre version these so we don't have to every page load.
for (i=0; i<app.config.local_css_files.length; i++) {
	app.config.local_css_files[i] = versionator.versionPath(app.config.local_css_files[i]);
}

for (i=0; i<app.config.local_js_files.length; i++) {
	app.config.local_js_files[i] = versionator.versionPath(app.config.local_js_files[i]);
}


/******************************************************************************
********* Set up res.err() and res.msg() stuff
******************************************************************************/
server.response.err = function(msg) {
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
	var sess = this.req.session;
	sess.flash_msgs = sess.flash_msgs || [];
	sess.flash_msgs.push(msg);
	return this;
};

// expose the "messages" local variable when views are rendered
server.locals.use(function(req, res) {
	res.locals.flash_errs = req.session.flash_errs || [];
	delete req.session.flash_errs;
	
	res.locals.flash_msgs = req.session.flash_msgs || [];
	delete req.session.flash_msgs;
	
	//console.log('Setting up flash messages.');
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
	res.locals.config = {};
	
	//res.locals.config should consist of things set for every page, making config a reserved global
	res.locals.config.logged_in = req.session.logged_in;//req.session.logged_in;
	
	res.locals.config.site_name = app.config.site_name;
	res.locals.config.static_url = app.config.static_url.slice(0);
	res.locals.config.css_files = app.config.local_css_files.slice(0);
	res.locals.config.js_files = app.config.local_js_files.slice(0);
	
	next();
});


/******************************************************************************
********* Add vhost to express
******************************************************************************/
app.express.use(express.vhost('*' + app.config.domains.admin , server))


/******************************************************************************
********* Load any routes. 
********* This is in a function so that the vhosts router can be set up
********* before the controllers try to use it.
******************************************************************************/
module.exports.boot = function()
{
	/******************************************************************************
	********* Load up the controllers
	********* ...should probably automate this somehow
	******************************************************************************/
	require('../admin/controllers/index');
	require('../admin/controllers/main');
	require('../admin/controllers/purge');
	require('../admin/controllers/mongo');
	require('../admin/controllers/users');


	/******************************************************************************
	********* Error handling middleware, 
	********* ...doesn't seem to working right now
	******************************************************************************/
	server.use(function(err, req, res, next){
		console.error(util.inspect(err, true, 5));
		
		res.locals.err = err;
		res.locals.inspect_text = util.inspect(err, true, 5);
		res.status(500).render(app.config.root + app.config.views_errors + '/500');
	});

	//server.use(express.errorHandler({dumpExceptions: true, showStack: true}));


	/******************************************************************************
	********* If nothing has responded by now, its a 404
	******************************************************************************/
	server.all('*', function(req, res, next) {
		res.status(404).render(app.config.root + app.config.views_errors + '/404', { url: req.originalUrl });
	});
}

