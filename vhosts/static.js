var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer()
	,mime = require('connect').mime 
;  
 
//Lookup and set the mime type for this file.
server.use(function(req, res, next) {
	var type = mime.lookup(req.url);
	var charset = mime.charsets.lookup(type);
	
	res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));

	next();
});

if (app.config.cache_static)
{
	server.use(function(req, res, next) {
		//http://condor.depaul.edu/dmumaugh/readings/handouts/SE435/HTTP/node24.html
		res.setHeader('Cache-Control', 'max-age=3600, must-revalidate'); //Throw a day on the cache
		next();
	});
	
	//server.use(express.staticCache());
}

server.use(require('../lib/poweredBy')); //Overwrite the x-powered-by header

server.use(express.responseTime());

server.use(express.static(app.config.root + app.config.static_dir));

//server.use(express.logger('STATIC :method :url - :res[content-type]'));
//server.use(express.directory(app.config.root + app.config.static_dir, {icons: true}));


app.express.use(express.vhost(app.config.domains.static, server))