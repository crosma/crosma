var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer()
	,mime = require('connect').mime 
	,versionator = require('versionator').createBasic(app.config.unique)
	,util = require('util')
;  


server.use(express.responseTime());

server.use(express.logger('STATIC :method :url - :res[content-type]'));

server.use(function(req, res, next) {
	var type = mime.lookup(req.url);
	var charset = mime.charsets.lookup(type);
	
	res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));

	next();
});

if (app.config.cache_static)
{
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

server.use(express.static(app.config.root + app.config.static_dir));

server.all('*', function(req, res){
  res.send('Not found.', 404);
});

app.express.use(express.vhost(app.config.domains.static, server))