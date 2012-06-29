var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer()
	,util = require('util')
;

server.use(express.favicon()); //Serve before logging so it does not get logged
server.use(express.logger('MAIN :method :url - :res[content-type]'));
server.use(express.responseTime());
server.use(express.static(app.config.root + app.config.static_dir)); //static stuff
server.use(express.cookieParser()); //Can take a secret to encrypt them
server.use(express.session({secret: 'sdfasdfasdfasdf', key: 'sid', cookie: {maxAge: 60 * 60 * 24 * 1000}}));
server.use(express.bodyParser()); // parse request bodies (req.body)
server.use(express.methodOverride('action')); // support _method input element (PUT in forms etc)


//Init the view engine
server.engine('html', require('jade').renderFile);
server.set('view engine', 'html');
if (app.config.cache_views) server.enable('view cache');
	
server.set('views', app.config.root + app.config.views_errors);	


// define a custom res.message() method
server.response.flash = function(msg) {
	// reference `req.session` via the `this.req` reference
	var sess = this.req.session;
	// simply add the msg to an array for later
	sess.messages = sess.messages || [];
	sess.messages.push(msg);
	
	return this;
};

// expose the "messages" local variable when views are rendered
server.locals.use(function(req, res) {
	var msgs = req.session.messages || [];

	// expose "messages" local variable
	res.locals.messages = msgs;

	// expose "hasMessages" 
	res.locals.hasMessages = !! msgs.length;

	// empty or "flush" the messages so they
	// don't build up
	req.session.messages = [];
});


app.express.use(express.vhost('*' + app.config.domains.main , server))

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

	// assume 404 since no middleware responded
	server.all('*', function(req, res, next) {
		res.flash('Fuck it.');
		
	
		res.render('woo.jade');
	
		//res.status(404).render('404', { url: req.originalUrl });
	});
}

