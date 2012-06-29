var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer();
;

server.use(express.logger('CATCHALL :method :url - :res[content-type]'));

server.all('*', function(req, res){
	res.redirect('http://violentsoul.com/'); 
});

app.express.use(express.vhost('*' , server))
