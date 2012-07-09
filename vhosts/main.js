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

server.use(express.favicon()); //Serve before logging so it does not get logged

//Logger is kind of two parts
server.use(function(req, res, next) { req.vhost_for_logger = 'MAIN'; next(); });
server.use(express.logger({format: 'mydev'}));


server.use(express.responseTime());
server.use(express.cookieParser()); //Can take a secret to encrypt them
server.use(express.session({secret: 'sdfasdfasdfasdf', key: 'sid', cookie: {maxAge: 60 * 60 * 24 * 1000}}));
server.use(express.bodyParser()); // parse request bodies (req.body)
server.use(express.methodOverride('action')); // support _method input element (PUT in forms etc)
server.use(require('../lib/poweredBy')); //Overwrite the x-powered-by header
server.use(server.router);


//Init the view engine
server.engine('html', require('jade').renderFile);
server.set('view engine', 'html');
if (app.config.cache_views) server.enable('view cache');
	
server.set('views', app.config.root + app.config.views_errors);	


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


app.express.use(express.vhost('*' + app.config.domains.main , server))

//server.get('/static/*', express.static(app.config.root + app.config.static_dir));

module.exports.boot = function()
{
	/*
	server.use(function(err, req, res, next){
		// treat as 404
		if (~err.message.indexOf('not found')) return next();

		// log it
		console.error(err.stack);

		// error page
		res.status(500).render('5xx');
	});
	*/
	
	server.use(express.errorHandler({dumpExceptions: true, showStack: true}));

	server.set('views', app.config.root + '/views');
	
	server.locals.use(function(req, res) {
		res.locals.config = {};
		
		//res.locals.globals.config should consist of things set for every page, making config a reserved global
		res.locals.config.site_name = app.config.site_name;
		res.locals.config.static_url = app.config.static_url;
		res.locals.config.bootstrap_css = app.config.bootstrap_css;
		res.locals.config.css_files = app.config.local_css_files;
		res.locals.config.js_files = app.config.local_js_files;
	});

	// assume 404 since no middleware responded
	server.all('*', function(req, res, next) {
		res.flash('Fuck it.');
		
	
		res.render('woo.jade');
	
		//res.status(404).render('404', { url: req.originalUrl });
	});
}

