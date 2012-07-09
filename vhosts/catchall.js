var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer();
;

//Logger is kind of two parts
server.use(function(req, res, next) { req.vhost_for_logger = 'CATCHALL'; next(); });
server.use(express.logger({format: 'mydev'}));

server.use(require('../lib/poweredBy')); //Overwrite the x-powered-by header

server.all('*', function(req, res){
	res.redirect('http://violentsoul.com/'); 
});

app.express.use(express.vhost('*' , server))
