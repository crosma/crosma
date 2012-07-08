var	 app = require('../../app')
	,util = require('util')
	,mdb = require('mongoose')
	,page = require('../../lib/controller')(app.servers.admin, {
		 title: 'Log In'
		,require_auth: false
	})
;

page.handles('/', 'get', function(req, res, next) {
	if (req.session.logged_in)
	{
		res.redirect('/main');
	}
	else
	{
		res.render('index.jade');
	}
});

page.handles('/', 'login', function(req, res, next) {
	var email = req.body.email.trim();
	var password = req.body.password;

	if (email != '' && password != '')
	{
		var query = mdb.schema.User.find({email: email});
	
		query.exec(mdb.handler(req, res, function (user) {
			if (user.length > 0 && user[0].authenticate(password))
			{
				req.session.logged_in = true;
				//req.session._user = user[0]._id;
				
				res.redirect('/main');
			}
			else
			{
				res.err('Invalid email or password.');
				res.render('index.jade');
			}
		}));
	}
	else
	{
		res.err('You must enter your email and password.');
		res.render('index.jade');
	}
	
	
});


page.handles('/logout', 'get', function(req, res, next) {
	res.msg('You have been logged out.');

	req.session.logged_in = false;
	
	res.redirect('/');
});
