var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer()
	,util = require('util')
	,versionator = require('../lib/versionator')(app.config.unique)
; 


//Fuck caching.
server.use(function(req, res, next) {
	//http://condor.depaul.edu/dmumaugh/readings/handouts/SE435/HTTP/node24.html
	res.setHeader('Cache-Control', 'max-age=0, no-store, private'); 
	next();
});


//Basic configuration
server.use(express.favicon()); //Serve before logging so it does not get logged
server.use(express.logger('dev'));
server.use(express.responseTime());
server.use(express.cookieParser()); //Can take a secret to encrypt them
server.use(express.session({secret: 'sdfasdfasdfasdf', key: 'sid', cookie: {maxAge: 60 * 60 * 24 * 1000}}));
server.use(express.bodyParser()); // parse request bodies (req.body)
server.use(express.methodOverride('action')); // support _method input element (PUT in forms etc)
server.use(require('../lib/poweredBy')); //Overwrite the x-powered-by header


//Init the view engine
server.set('view engine', 'jade');
server.set('views', app.config.root + app.config.admin_views_dir);
if (app.config.cache_views) server.enable('view cache');


server.locals({
	versionPath: versionator.versionPath
});

module.exports.boot = function()
{
	// define a custom res.message() method
	server.response.err = function(msg) {
		var sess = this.req.session;
		sess.flash_errs = sess.flash_errs || [];
		sess.flash_errs.push(msg);
		return this;
	};
	
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
		
		console.log('Handling flash messages...');
		
	});
	
	
	//Set up res.locals.config ...its all needed on every page
	server.use(function(req, res, next) {
		res.locals.config = {};
		
		//res.locals.config should consist of things set for every page, making config a reserved global
		res.locals.config.logged_in = req.session.logged_in;//req.session.logged_in;
		
		res.locals.config.site_name = app.config.site_name;
		res.locals.config.static_url = app.config.static_url;
		res.locals.config.css_files = app.config.local_css_files;
		res.locals.config.js_files = app.config.local_js_files;
		
		console.log('Config...');
		
		next();
	});
	
	require('../admin/controllers/index');
	require('../admin/controllers/main');
	require('../admin/controllers/purge');
	
	server.get('/test', function(req, res, next) {
		res.render('bs.jade');
	});
	
	server.use(function(err, req, res, next){
		console.error(util.inspect(err, true, 5));
		
		res.locals.err = err;
		res.locals.inspect_text = util.inspect(err, true, 5);
		res.status(500).render(app.config.root + app.config.views_errors + '/500');
	});
	
	//server.use(express.errorHandler({dumpExceptions: true, showStack: true}));

	// assume 404 since no middleware responded
	server.all('*', function(req, res, next) {
		res.status(404).render(app.config.root + app.config.views_errors + '/404', { url: req.originalUrl });
	});

	app.express.use(express.vhost('*' + app.config.domains.admin , server))
}

