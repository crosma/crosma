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
server.use(server.router);


//Init the view engine
server.set('view engine', 'jade');
if (app.config.cache_views) server.enable('view cache');


// define a custom res.message() method
server.response.flash = function(msg) {
	var sess = this.req.session;
	sess.messages = sess.messages || [];
	sess.messages.push(msg);
	return this;
};

// expose the "messages" local variable when views are rendered
server.locals.use(function(req, res) {
	var msgs = req.session.messages || [];
	res.locals.messages = msgs;
	res.locals.hasMessages = !! msgs.length;
	req.session.messages = [];
});

server.locals({
	versionPath: versionator.versionPath
});


app.express.use(express.vhost('*' + app.config.domains.admin , server))

module.exports.boot = function()
{
	server.set('views', app.config.root + app.config.admin_views_dir);
	
	/*
		res.flash('Fuck it.');
		res.render('bs.jade');
	*/
	
	server.locals.use(function(req, res) {
		res.locals.config = {};
		
		//res.locals.globals.config should consist of things set for every page, making config a reserved global
		res.locals.config.site_name = app.config.site_name;
		res.locals.config.static_url = app.config.static_url;
		res.locals.config.css_files = app.config.local_css_files;
		res.locals.config.js_files = app.config.local_js_files;
	});

	server.use(express.errorHandler({dumpExceptions: true, showStack: true}));
	
	// assume 404 since no middleware responded
	server.all('*', function(req, res, next) {
		//server.set('views', );
		 
		res.status(404).render(app.config.root + app.config.views_errors + '/404', { url: req.originalUrl });
	});
}

