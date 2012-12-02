var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,tools = require('../../lib/tools')
	,async = require('async')
	,chronicle = require('chronicle')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Users'
	})
;


//slice(0) clones an array
var local_css_files = app.config.local_css_files.slice(0).concat([
	 app.staticize('/css/lib/jquery-ui-timepicker-addon.css')
	,app.staticize('/css/lib/jquery-ui-1.8.21.custom.css')
]);

var local_js_files = app.config.local_js_files.slice(0).concat([
	 app.staticize('/js/lib/jquery-ui-1.8.21.custom.min.js')
	,app.staticize('/js/lib/jquery-ui-sliderAccess.js')
	,app.staticize('/js/lib/jquery-ui-timepicker-addon.js')
]);

//middleware function to set the statics to custom values
function set_statics(req, res, next) {
	res.locals.config.css_files = local_css_files;
	res.locals.config.js_files = local_js_files;
	next();
}


page.handles('/users/:page?', 'get', function(req, res, next) {
	var per_page = 25;
	var page = Math.max(1, req.params.page ? parseInt(req.params.page) : 1);
	
	async.waterfall([
	function(callback){
		app.mysql.query(
			'SELECT SQL_CALC_FOUND_ROWS user_id, email, created_dt, name FROM user ORDER BY user_id ASC LIMIT :start, :count'
			,{start: page * per_page - per_page, count: per_page}
			,function(err, result) {
				callback(err, result);
			}
		);
	},
	
	function(users, callback){
		app.mysql.query_found_rows(
			function(err, count) {
				callback(err, users, count);
			}
		);
	},
	
	], function (err, users, count) {
		if (err) { next(err); return; }
	
		res.locals.users = users;
		res.locals.page = page;
		res.locals.page_count = Math.ceil(count / per_page);

		res.render('./users/list'); 
	});

});



page.handles('/user/:who/edit', 'get', set_statics, function(req, res, next) {
	var who = parseInt(req.params.who);

	async.waterfall([
	function(callback){
		app.mysql.query_row(
			'SELECT user_id, email, created_dt, name FROM user WHERE user_id = :id'
			,{id: who}
			,callback
		);
	},
	
	], function (err, user) {
		if (err) { next(err); return; }
		
		if (user) {
			res.locals.method = 'save';
			res.locals.user = user;
			res.render('./users/edit');	
		
		} else {
			res.err('Could not find "' + who + '".');
			res.redirect('/users');
		}
	});
	
});


page.handles('/user/:who/edit', 'post', set_statics, function(req, res, next) {
	var who = req.params.who;
	
	mdb.schema.User.findUnique(who, mdb.handler(req, res, function (user) {
		if (user) {
			user.email = req.body.email.toString().trim();
			user.name.first = req.body.firstname.toString().trim();
			user.name.last = req.body.lastname.toString().trim();
			user.registered_date = Date.parse(req.body.registered_date.toString().trim());
			
			//check the password first so that there can be no errors cluttering it.
			if (req.body.password != '' || req.body.password2 != '') //only check if either has a value
			{
				req.check('password', 'The passwords you entered do not match.').equals(req.body.password2);
				req.check('password', 'Passwords must be at least 6 characters.').len(6);
				
				//only set if no errors
				if (res.err_count() == 0)
				{
					user.password = req.body.password;
				}
			}
			
			req.check('email', 'Please enter a valid email').isEmail();
			req.check('firstname', 'Please enter a first name').notEmpty();
			req.check('lastname', 'Please enter a last name').notEmpty();
			req.check('registered_date', 'Please enter a valid created date\time').isDate();
			
			
			//Woo, we can save
			if (res.err_count() == 0)
			{
				user.save();
			
				res.msg('The user has been saved.');
			}
			
			res.locals.method = 'save';
			res.locals.user = user;
			res.render('./users/edit');

		} else {
			res.err('Could not find "' + who + '".');
			res.redirect('/users');
		}
	}));
	
});


page.handles('/user/create', 'get', set_statics, function(req, res, next) {
	res.locals.method = 'create';
	res.locals.user = {name: '', email: ''};
	
	res.render('./users/edit');
});


page.handles('/user/create', 'post', set_statics, function(req, res, next) {
	var email = req.body.email.toString().trim();
	var name = req.body.name.toString().trim();

	req.check('email', 'Please enter a valid email.').isEmail();
	req.check('name', 'Please enter a name.').notEmpty();
	req.check('password', 'The passwords you entered do not match.').equals(req.body.password2);
	req.check('password', 'Passwords must be at least 6 characters.').len(6);
	
	async.waterfall([
	function(callback){ //check form
		if (res.err_count() == 0) {
			callback();
		} else {
			callback(new Error(''));
		}
	},
	function(callback){ //run email check query
		app.mysql.query_var(
			 'SELECT user_id FROM user WHERE email = :email'
			,{email: email}
			,function(err, result) {
				if (err) {
					throw err;
				} else {
					callback(null, result);
				}
			}
		);
	},
	function(exists, callback){ //check results
		if (exists) {
			callback(new Error('User with that email already exists.'));
		} else {
			callback();
		}
	},
	function(callback){ //hash password
		var pass = req.body.password.toString();
		
		tools.createPassword(pass, callback);
	},
	function(password_salt, password_hashed, callback){ //seems were good, create the user
		app.mysql.query(
			 'INSERT INTO user SET email = :email, password_hashed = :password_hashed, password_salt = :password_salt, name = :name, created_dt = NOW()'
			,{email: email, password_hashed: password_hashed, password_salt: password_salt, name: name}
			,function(err, result) {
				if (err) {
					throw err;
				} else {
					callback(null, result.insertId);
				}
			}
		);
	},
	], function (err, user_id) {
		if (err) {
			app.debug("Create Error: " + err.message);
			
			res.err(err.message);
			res.locals.method = 'create';
			res.locals.user = {'name': name, 'email': email};
			res.render('./users/edit');	
		} else {
			app.debug("Create Success: " + user_id);

			res.msg('The user has been created.');
			res.redirect('/user/' + user_id + '/edit');
		}
	});
	
});


page.handles('/user/:who/delete', 'get', function(req, res, next) {
	var who = req.params.who;

	mdb.schema.User.findUnique(who, mdb.handler(req, res, function (user) {
		if (user) {
			res.locals.user = user;
			res.render('./users/delete');
			
		} else {
			res.err('Could not find "' + who + '".');
			res.redirect('/users');
		}
	}));
	
});


page.handles('/user/:who/delete', 'post', function(req, res, next) {
	var who = req.params.who;
	
	mdb.schema.User.findUnique(who, mdb.handler(req, res, function (user) {
		if (user) {
			user.remove();
			
			res.msg('The user has been deleted.');
			
			res.redirect('/users');

		} else {
			res.err('Could not find "' + who + '".');
			res.redirect('/users');
		}
	}));
	
});

