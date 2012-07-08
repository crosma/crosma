var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mdb = require('mongoose')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Users'
	})
;


page.handles('/users/:page?', 'get', function(req, res, next) {
	var filter = {};

	mdb.schema.User.count(filter, mdb.handler(req, res, function (count) {

		var per_page = 20;
		var page_count = Math.ceil(count / per_page);
		var page = Math.max(1, Math.min(page_count, req.params.page ? req.params.page : 1));
		
		var query = mdb.schema.User
			.find(filter)
			.select('email', 'name.first', 'name.last', 'name.abbr')
			.sort('name.last', 1)
			.sort('name.first', 1)
			.skip((page - 1) * per_page)
			.limit(per_page)
		;
		
		var pages = [];
		for (i=1; i<=page_count; i++)
		{
			pages.push([i, '/users/' + i]);
		}
		
		
		query.exec(mdb.handler(req, res, function (users) {
			res.locals.users = users;
			res.locals.page = page;
			res.locals.page_count = page_count;
			res.locals.pages = pages;

			res.render('./users/list');
		}));

	}));
	
});



page.handles('/user/:who/edit', 'get', function(req, res, next) {
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


page.handles('/user/:who/edit', 'post', function(req, res, next) {
	var who = req.params.who;
	
	mdb.schema.User.findUnique(who, mdb.handler(req, res, function (user) {
		if (user) {
			console.log(util.inspect(req.body));
		
			user.email = req.body.email.toString().trim();
			user.name.first = req.body.name.first.toString().trim();
			user.name.last = req.body.name.last.toString().trim();
			
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
			req.check('name.first', 'Please enter a first name').notEmpty();
			req.check('name.last', 'Please enter a last name').notEmpty();
			
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


page.handles('/user/create', 'get', function(req, res, next) {
	res.locals.method = 'create';
	res.locals.user = {name: {first: '', last: ''}, email: ''};
	res.render('./users/edit');
});


page.handles('/user/create', 'post', function(req, res, next) {
	var user = new mdb.schema.User;
	user.email = req.body.email.trim();
	user.name.first = req.body.firstname.trim();
	user.name.last = req.body.lastname.trim();
	
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