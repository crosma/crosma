var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer()
	,mime = require('connect').mime 
	,chronicle = require('chronicle')
	,util = require('util')
;  


server.use(express.responseTime());

//Set the Content-Type header to the assumed mime type
server.use(function(req, res, next) {
	var type = mime.lookup(req.url);
	var charset = mime.charsets.lookup(type);
	
	res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));

	next();
});

if (app.config.cache_static)
{
	//only log if caching, otherwise it gets overwhelming during development
	//Logger is kind of two parts
	server.use(function(req, res, next) { req.vhost_for_logger = 'STATIC'; next(); });
	server.use(express.logger({format: 'mydev'}));

	server.use(function(req, res, next) {
		res.setHeader('Cache-Control', 'max-age=' + 60 * 60 * 24 * 7 + ', public'); //Throw a day on the cache
		next();
	});
}
else
{
	server.use(function(req, res, next) {
		res.setHeader('Cache-Control', 'max-age=0, no-store, private'); 
		next();
	});
}

server.use(require('../lib/poweredBy')); //Overwrite the x-powered-by header 

server.use(chronicle.middleware);

server.use(require('less-middleware')({
	 src: app.config.root + '/work'
	,dest: app.config.root + app.config.static_dir + ''
	,once: false //app.config.cache_static //Only check for changes once if static cache is enabled //Dont really need to, varnish fixes the need
}));

server.use(express.static(app.config.root + app.config.static_dir));

server.all('*', function(req, res){
  res.send('Not found.', 404);
});

app.express.use(express.vhost(app.config.domains.static, server))