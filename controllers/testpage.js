var	 app = require('../app')
	,util = require('util')
	,page = require('../lib/controller')(app.servers.main, {
		title: 'Test Page Controller...'
	})
;

page.handles('/test', 'get', function(req, res, next) {
	//res.send('Cunt');
	
	res.write('<form action="/test" method="action"><input type="text" name="_method" value="saveall" /></form>');
	
	res.end();
	
	//res.send(util.inspect(res))
	
	//next();
});

page.handles('/test', 'saveall', function(req, res, next) {
	
}, function(req, res, next) {
	res.send(util.inspect(server))
	
	//res.end();
})