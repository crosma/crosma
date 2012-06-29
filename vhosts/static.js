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


server.use(express.logger('STATIC :method :url - :res[content-type]'));
server.use(express.responseTime());
server.use(express.static(app.config.root + app.config.static_dir));
server.use(express.directory(app.config.root + app.config.static_dir, {icons: true}));


app.express.use(express.vhost(app.config.domains.static, server))