var	 app = require('../app')
	,express = require('express')
	,server = module.exports = express.createServer();
;

server.use(express.logger('STATIC :method :url - :res[content-type]'));
server.use(express.responseTime());
server.use(express.static(app.config.root + app.config.static_dir));
server.use(express.directory(app.config.root + app.config.static_dir, {icons: true}));

app.express.use(express.vhost('s*.violentsoul.com', server))