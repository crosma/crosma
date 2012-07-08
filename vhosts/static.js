var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer()
	,mime = require('connect').mime 
	,versionator = require('../lib/versionator')(app.config.unique)
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
	//only log if caching, otherwise it gets overwhelming
	server.use(express.logger('STATIC :method :url - :res[content-type]'));

	server.use(function(req, res, next) {
		res.setHeader('Cache-Control', 'max-age=3600, public'); //Throw a day on the cache
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

server.use(versionator.middleware);

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