var	 app = require('../../app')
	,util = require('util')
	,mdb = require('mongoose')
	,page = require('../../lib/controller')(app.servers.main, {
		 title: 'crosma.us'
		,require_auth: false
	})
;


page.handles('/', 'get', function(req, res, next) {
	if (req.session.logged_in)
	{
		//res.redirect('/main');
	}
	else
	{
		res.render('index.jade');
	}
});
