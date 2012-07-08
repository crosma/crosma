var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mongoose = require('mongoose')
	,schema = require('../../lib/mongo/schema')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Users'
	})
;


function handler(req, res, cb)
{
	var hnd = function(err, result) {
		if (err)
		{
			console.log('---Mongo---' + err + '---Mongo---');
			throw Error('MongoDB Error: ' + err);
		}
		else
		{
			cb(result);
		}
	}
	
	return hnd;
}

page.handles('/users/:page?', 'get', function(req, res, next) {
	var filter = {};

	schema.User.count(filter, handler(req, res, function (count) {

		var per_page = 2;
		var pages = Math.ceil(count / per_page);
		var page = Math.max(1, Math.min(pages, req.params.page ? req.params.page : 1));
		
		var query = schema.User
			.find(filter)
			.select('email', 'name.first', 'name.last', 'name.abbr')
			.sort('name.last', 1)
			.sort('name.first', 1)
			.skip((page - 1) * per_page)
			.limit(per_page)
		;
		
		query.exec(handler(req, res, function (users) {
			res.locals.users = users;

			res.render('./users/list');
		}));

	}));
	
});

/*
page.handles('/users/:page?', 'get', function(req, res, next) {
	var filter = {'name.first': 'Matt'};

	schema.User.count(filter, function (err, count) {
		if (err) {throw Error('Can\'t count users...');} else {
			var per_page = 2;
			var pages = Math.ceil(count / per_page)
			var page = Math.min(pages, req.params.page ? req.params.page : 1);
			
			
			var query = schema.User
				.find(filter)
				.select('email', 'name.first', 'name.last', 'name.abbr')
				.sort('name.last', 1)
				.sort('name.first', 1)
			;
	
			console.log('--- ' + count);

			query.exec(function (err, users) {
				if (err) {
					throw Error('Can\'t get users...');
					
				} else {
					res.locals.users = users;
					
					console.log('----users ' + users);
					
					res.render('./users/list');
				}
				
			});
		}

	})
	
});
*/

page.handles('/user/:who/edit', 'get', function(req, res, next) {
	var who = req.params.who;

	schema.User.findUnique(who, function (err, user) {
		if (err) {
			res.msg('huh');
			throw Error('Can\'t get users...');
			
		} else {
			if (user) {
				res.locals.user = user;
				res.render('./users/edit');
				
			} else {
				res.err('Could not find "' + who + '".');
				res.redirect('/users');
			}
		}
		
	});
	
});

page.handles('/user/:who/edit', 'post', function(req, res, next) {
	var who = req.params.who;

	schema.User.findUnique(who, function (err, user) {
		if (err) {
			res.msg('huh');
			throw Error('Can\'t get users...');
			
		} else {
			if (user) {
				res.locals.user = user;
				res.render('./users/edit');
				
			} else {
				res.err('Could not find "' + who + '".');
				res.redirect('/users');
			}
		}
	});
	
	
	/*
	var instance = new schema.User;
	instance.name.first = 'CAp';
	instance.name.last = 'tEsT';
	instance.email = 'cApTeSt@gmail.com';
	instance.password = 'captest';
	
	instance.save(function (err) {
		if (err) {
			res.err('<b>Error saving user:</b> ' + err);
			
		} else {
			res.msg('User saved.');
		}
		
	});
	
	res.locals.user = instance;
	res.render('./users/edit');
	*/
});