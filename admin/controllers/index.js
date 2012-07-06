var	 app = require('../../app')
	,util = require('util')
	,page = require('../../lib/controller')(app.servers.admin, {
		 title: 'Log In'
		,require_auth: false
	})
;

page.handles('/', 'get', function(req, res, next) {
	if (req.session.logged_in)
	{
		res.render('main.jade');
	}
	else
	{
		res.render('index.jade');
	}
});

page.handles('/', 'login', function(req, res, next) {
	res.msg('Handle logging in...');

	req.session.logged_in = true;
	
	res.render('main.jade');
});

page.handles('/logout', 'get', function(req, res, next) {
	res.msg('You have been logged out.');

	req.session.logged_in = false;
	
	res.render('index.jade');
});
