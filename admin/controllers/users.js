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
	,app.staticize('/js/lib/jquery.tablesorter.js')
]);

//middleware function to set the statics to custom values
function set_statics(req, res, next) {
	res.locals.config.css_files = local_css_files;
	res.locals.config.js_files = local_js_files;
	next();
}

function breadcrumb(req, res, next) {
	res.locals.breadcrumbs.push({text: 'Users', href: '/users'});
	next();
}

//['/users/:page?/search/:search?', '/users/search/:search', '/users/:page?']
page.handles(/^\/users(?:\/page\/(\d+))?(?:\/search\/(.*?))?\/?$/im, 'get', set_statics, breadcrumb, function(req, res, next) {
	var per_page = 5;
	var page = req.params[0] ? parseInt('0' + req.params[0]) : 1;
	var search = req.params[1];
	var breadcrumb = 'Page: ' + page;


	var sql = 'SELECT SQL_CALC_FOUND_ROWS user_id, email, created_dt, name FROM user ORDER BY user_id ASC LIMIT :start_page, :per_page';
	var data = {start_page: page * per_page - per_page, per_page: per_page};
	if (search != undefined) {
		breadcrumb += ', Search: "' + search + '"';
	
		data.search = search;
		data.search_str = '%' + search + '%';
		
		if (parseInt(search) > 0 && parseInt('0' + search) % 1 === 0) {
			sql = 'SELECT SQL_CALC_FOUND_ROWS user_id, email, created_dt, name FROM user WHERE user_id = :search ORDER BY user_id ASC LIMIT :start_page, :per_page';
		} else {
			sql = 'SELECT SQL_CALC_FOUND_ROWS user_id, email, created_dt, name FROM user WHERE email LIKE :search_str OR name LIKE :search_str ORDER BY user_id ASC LIMIT :start_page, :per_page';
		}
	}
	
	async.waterfall([
	function(callback){
		req.db.query(
			 sql
			,data
			,function(err, users) {
				callback(err, users);
			}
		);
	},
	
	function(users, callback){
		req.db.query_found_rows(
			function(err, count) {
				if (err) {
					throw err;
				} else {
					callback(err, users, count);
				}
			}
		);
	},
	
	], function (err, users, count) {
		if (err) { next(err); return; }
	
		res.locals.breadcrumbs.push({text: breadcrumb});
		res.locals.users = users;
		res.locals.page = page;
		res.locals.page_count = Math.ceil(count / per_page);
		res.locals.search = search;

		res.render('./users/list.jade'); 
	});

});



page.handles(/^\/users2(?:\/page\/(\d+))?(?:\/search\/(.*?))?\/?$/im, 'get', set_statics, breadcrumb, function(req, res, next) {
	var per_page = 5;
	var page = req.params[0] ? parseInt('0' + req.params[0]) : 1;
	var search = req.params[1];
	var breadcrumb = 'Page: ' + page;


	var sql = 'SELECT SQL_CALC_FOUND_ROWS user_id, email, created_dt, name FROM user ORDER BY user_id ASC LIMIT :start_page, :per_page';
	var data = {start_page: page * per_page - per_page, per_page: per_page};
	if (search != undefined) {
		breadcrumb += ', Search: "' + search + '"';
	
		data.search = search;
		data.search_str = '%' + search + '%';
		
		if (parseInt(search) > 0 && parseInt('0' + search) % 1 === 0) {
			sql = 'SELECT SQL_CALC_FOUND_ROWS user_id, email, created_dt, name FROM user WHERE user_id = :search ORDER BY user_id ASC LIMIT :start_page, :per_page';
		} else {
			sql = 'SELECT SQL_CALC_FOUND_ROWS user_id, email, created_dt, name FROM user WHERE email LIKE :search_str OR name LIKE :search_str ORDER BY user_id ASC LIMIT :start_page, :per_page';
		}
	}
	
	async.waterfall([
	function(callback){
		req.db.query(
			 sql
			,data
			,function(err, users) {
				callback(err, users);
			}
		);
	},
	
	function(users, callback){
		req.db.query_found_rows(
			function(err, count) {
				if (err) {
					throw err;
				} else {
					callback(err, users, count);
				}
			}
		);
	},
	
	], function (err, users, count) {
		if (err) { next(err); return; }
	
		res.locals.breadcrumbs.push({text: breadcrumb});
		res.locals.users = users;
		res.locals.page = page;
		res.locals.page_count = Math.ceil(count / per_page);
		res.locals.search = search;

		res.render('./users/list.ect'); 
	});

});



page.handles('/user/:who/edit', 'get', set_statics, breadcrumb, function(req, res, next) {
	var who = parseInt(req.params.who);

	async.waterfall([
	function(callback){
		req.db.query_row(
			'SELECT user_id, email, created_dt, name FROM user WHERE user_id = :id'
			,{id: who}
			,callback
		);
	},
	
	], function (err, user) {
		if (err) {
			throw err;
		} else if (user) {
			res.locals.breadcrumbs.push({text: 'Edit: ' + user.user_id});
			res.locals.method = 'save';
			res.locals.user = user;
			
			res.render('./users/edit');	
		
		} else {
			res.err('Could not find "' + who + '".');
			res.redirect('/users');
		}
	});
	
});


page.handles('/user/:who/edit', 'post', set_statics, breadcrumb, function(req, res, next) {
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
			if (res.err_count() == 0) {
				user.save();
			
				res.msg('The user has been saved.');
			}
			
			res.locals.breadcrumbs.push({text: 'Edit: ' + user.user_id});
			res.locals.method = 'save';
			res.locals.user = user;
			
			res.render('./users/edit');

		} else {
			res.err('Could not find "' + who + '".');
			res.redirect('/users');
		}
	}));
	
});


page.handles('/user/create', 'get', set_statics, breadcrumb, function(req, res, next) {
	res.locals.breadcrumbs.push({text: 'Create User'});
	res.locals.method = 'create';
	res.locals.user = {name: '', email: ''};
	
	res.render('./users/edit');
});


page.handles('/user/create', 'post', set_statics, breadcrumb, function(req, res, next) {
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
		req.db.query_var(
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
		req.db.query(
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
			
			res.locals.breadcrumbs.push({text: 'Create User'});
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


page.handles('/user/:user_id/delete', 'get', breadcrumb, function(req, res, next) {
	var user_id = parseInt(req.params.user_id);

	req.db.query_row(
		 'SELECT user_id, name, email FROM user WHERE user_id = :user_id'
		,{user_id: user_id}
		,function(err, user) {
			if (err) {
				throw err;
			} else if (user) {
				res.locals.breadcrumbs.push({text: 'Delete: ' + user.user_id});
				res.locals.user = user;
				res.render('./users/delete');
			} else {
				res.err('Could not find user_id ' + user_id + '.');
				res.redirect('/users');
			}
		}
	);
});


page.handles('/user/:user_id/delete', 'post', breadcrumb, function(req, res, next) {
	var user_id = parseInt(req.params.user_id);
	
	async.waterfall([
	function(callback){ //run email check query
		req.db.query_var(
			 'DELETE FROM user WHERE user_id = :user_id'
			,{user_id: user_id}
			,function(err) {
				if (err) {
					throw err;
				} else {
					callback(null);
				}
			}
		);
	},
	function(callback){ //check results
		req.db.query_row_count(
			function(err, count) {
				callback(err, count);
			}
		)
	},
	], function (err, count) {
		if (count) {
			res.msg('The user has been deleted.');
			res.redirect('/users');

		} else {
			res.err('Could not find user_id ' + user_id + '.');
			res.redirect('/users');
		}
	});
});

