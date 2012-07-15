var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mdb = require('mongoose')
	,async = require('async')
	,chronicle = require('chronicle')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Users'
	})
;


//middleware function to set the statics to custom values
function set_statics(req, res, next) {
	res.locals.config.css_files = local_css_files;
	res.locals.config.js_files = local_js_files;
	next();
}

//slice(0) clones an array
local_css_files = app.config.local_css_files.slice(0).concat([
	 app.staticize('/css/lib/jquery-ui-timepicker-addon.css')
	,app.staticize('/css/lib/jquery-ui-1.8.21.custom.css')
]);

local_js_files = app.config.local_js_files.slice(0).concat([
	 app.staticize('/js/lib/jquery-ui-1.8.21.custom.min.js')
	,app.staticize('/js/lib/jquery-ui-sliderAccess.js')
	,app.staticize('/js/lib/jquery-ui-timepicker-addon.js')
]);


page.handles('/users/:page?', 'get', function(req, res, next) {
	var filter = {};
	var per_page = 5;
	
	async.waterfall([
		function(callback) { //get user count
			mdb.schema.User.count(filter, callback); //just send callback to the query
		},
		
		function(count, callback) { //get a page of users
			var page_count = Math.ceil(count / per_page);
			var page = Math.max(1, Math.min(page_count, req.params.page ? req.params.page : 1));
			
			var query = mdb.schema.User
				.find(filter)
				.select('email', 'name.first', 'name.last', 'name.abbr', 'registered_date')
				.sort('name.last', 1)
				.sort('name.first', 1)
				.skip((page - 1) * per_page)
				.limit(per_page)
			;
			
			query.exec(function (err, users) {
				callback(err, users, page, page_count);
			});
		},
	], function (err, users, page, page_count) { //render page
		res.locals.users = users;
		res.locals.page = page;
		res.locals.page_count = page_count;

		res.render('./users/list');
	});
	
});



page.handles('/user/:who/edit', 'get', set_statics, function(req, res, next) {
	var who = req.params.who;

	mdb.schema.User.findUnique(who, mdb.handler(req, res, function (user) {
		if (user) {
			res.locals.method = 'save';
			res.locals.user = user;
			res.render('./users/edit');
			
		} else {
			res.err('Could not find "' + who + '".');
			res.redirect('/users');
		}
	}));
	
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
	res.locals.user = {name: {first: '', last: ''}, email: ''};
	res.render('./users/edit');
});


page.handles('/user/create', 'post', set_statics, function(req, res, next) {
	var user = new mdb.schema.User;
	user.email = req.body.email.toString().trim();
	user.name.first = req.body.firstname.toString().trim();
	user.name.last = req.body.lastname.toString().trim();
	
	res.locals.method = 'create';

	mdb.schema.User.findUnique(user.email, mdb.handler(req, res, function (exists) {
		if (exists) {
			res.err('User with that email already exists.');
			
			res.locals.method = 'create';
			res.locals.user = user;
			res.render('./users/edit');
			
		} else {
			//check the password first so that there can be no errors cluttering it.
			req.check('password', 'The passwords you entered do not match.').equals(req.body.password2);
			req.check('password', 'Passwords must be at least 6 characters.').len(6);
			
			//only set if no errors
			if (res.err_count() == 0)
			{
				user.password = req.body.password;
			}
			
			req.check('email', 'Please enter a valid email').isEmail();
			req.check('firstname', 'Please enter a first name').notEmpty();
			req.check('lastname', 'Please enter a last name').notEmpty();
			
			//Woo, we can save
			if (res.err_count() == 0) {
				user.save(mdb.handler(req, res, function (exists) {
					res.msg('The user has been created.');
					
					res.redirect('/user/' + user._id + '/edit');
				}));
			}
			else
			{
				res.locals.method = 'create';
				res.locals.user = user;
				res.render('./users/edit');
			}
		}
	}));
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

