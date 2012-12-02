var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express();
;

//Logger is kind of two parts
server.use(function(req, res, next) { req.vhost_for_logger = 'CATCHALL'; next(); });
server.use(express.logger({format: 'mydev'}));

server.use(require('../lib/poweredBy')); //Overwrite the x-powered-by header

server.all('*', function(req, res){
	res.redirect('http://' + app.config.domains.main); 
});

app.express.use(express.vhost('*' , server))
