var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer()
	,util = require('util')
; 


//Fuck caching.
server.use(function(req, res, next) {
	//http://condor.depaul.edu/dmumaugh/readings/handouts/SE435/HTTP/node24.html
	res.setHeader('Cache-Control', 'max-age=0, no-store'); //Throw a day on the cache
	next();
});

server.use(express.favicon()); //Serve before logging so it does not get logged
server.use(express.logger('MAIN :method :url - :res[content-type]'));
server.use(express.responseTime());
server.use(express.cookieParser()); //Can take a secret to encrypt them
server.use(express.session({secret: 'sdfasdfasdfasdf', key: 'sid', cookie: {maxAge: 60 * 60 * 24 * 1000}}));
server.use(express.bodyParser()); // parse request bodies (req.body)
server.use(express.methodOverride('action')); // support _method input element (PUT in forms etc)
server.use(require('../lib/poweredBy')); //Overwrite the x-powered-by header


//Init the view engine
server.engine('html', require('jade').renderFile);
server.set('view engine', 'html');
//if (app.config.cache_views) server.enable('view cache');
	
server.set('views',     app.config.root       +     app.config.views_errors);	


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



app.express.use(express.vhost('*' + app.config.domains.main , server))

//server.get('/static/*', express.static(app.config.root + app.config.static_dir));

module.exports.boot = function()
{
	server.use(function(err, req, res, next){
		// treat as 404
		if (~err.message.indexOf('not found')) return next();

		// log it
		console.error(err.stack);

		// error page
		res.status(500).render('5xx');
	});


	server.set('views', app.config.root + '/views');
	
	server.locals.use(function(req, res) {
		res.locals.globals = {};
		res.locals.globals.site_name = app.config.site_name;
		res.locals.globals.static_url = app.config.static_url;
	});

	// assume 404 since no middleware responded
	server.all('*', function(req, res, next) {
		res.flash('Fuck it.');
		
	
		res.render('woo.jade');
	
		//res.status(404).render('404', { url: req.originalUrl });
	});
}

