var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Main'
	})
;


page.handles('/main', 'get', function(req, res, next) {
	res.render('main.jade');
});