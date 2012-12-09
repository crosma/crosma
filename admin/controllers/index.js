var	 app = require('../../app')
	,util = require('util')
	,tools = require('../../lib/tools')
	,page = require('../../lib/controller')(app.servers.admin, {
		 title: 'Log In'
		,require_auth: false
	})
;


page.handles('/', 'get', function(req, res, next) {
	if (req.session.logged_in) {
		res.redirect('/main');
	} else {
		res.render('index.jade');
	}
});

page.handles('/', 'login', function(req, res, next) {
	var email = req.body.email.trim();
	var password = req.body.password;

	if (email != '' && password != '') {
		app.mysql.query_row(
			 'SELECT * FROM user WHERE email = :email LIMIT 1'
			,{email: email}
			,function(err, result, f) {
				if (err) { next(err); return; }
				
				if (result) {
					tools.checkPassword(password, result.password_hashed, result.password_salt, function(err, is_good) {
						if (is_good) {
							app.log('Good admin login from ' + result.name + ' (' + result.email + ')');
						
							req.session.logged_in = true;

							res.redirect('/main');
						} else {
							app.alert('Bad admin login password. (' + email + ')');
						
							res.err('Invalid email or password.');
							res.render('index.jade');
						}
					});
					
				} else {
					app.alert('Bad admin login email. (' + email + ')');
					
					res.err('Invalid email or password.');
					res.render('index.jade');
				}
			}
		);
		
	}
	else
	{
		res.err('You must enter your email and password.');
		res.render('index.jade');
	}
	
});


page.handles('/logout', 'get', function(req, res, next) {
	delete res.locals.config.logged_in;

	req.session.regenerate(function(err){
		app.debug('Admin logged out.');

		res.msg('You have been logged out.');
		res.render('index.jade');
	});
});