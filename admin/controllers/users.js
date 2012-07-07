var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mongoose = require('mongoose')
	,schema = require('../../lib/mongo/schema')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Users'
	})
;


page.handles('/users', 'get', function(req, res, next) {

	var query = schema.User.find()
		.select('email', 'name')
		.sort('name.last', 1)
		.sort('name.first', 1)
	;
	
	query.exec(function (err, users) {
		if (err)
		{
			throw Error('Can\'t get users...');
		}
		else
		{
			res.locals.users = users;
			
			res.render('./users/list');
		}
	});

});

page.handles('/user/:who/edit', 'get', function(req, res, next) {
	var who = req.params.who;
	var query = who.indexOf('@') >= 0 ? schema.User.findOne({email_lower: who.toLowerCase()}) : schema.User.findById(who);
	

	query.exec(function (err, user) {
		if (err)
		{
			res.msg('huh');
			throw Error('Can\'t get users...');
		}
		else
		{
			if (user)
			{
				res.locals.user = user;
				res.render('./users/edit');
			}
			else
			{
				res.err('Could not find "' + who + '".');
				res.redirect('/users');
			}
		}
	});
	
});

page.handles('/user/:who/edit', 'save', function(req, res, next) {
	var who = req.params.who;
	var query = who.indexOf('@') >= 0 ? schema.User.findOne({email_lower: who.toLowerCase()}) : schema.User.findById(who);
	

	var instance = new schema.User;
	instance.name.first = 'CAp';
	instance.name.last = 'tEsT';
	instance.email = 'cApTeSt@gmail.com';
	instance.password = 'captest';
	
	instance.save(function (err) {
		if (err)
		{
			res.err('<b>Error saving user:</b> ' + err);
		}
		else
		{
			res.msg('User saved.');
			
		}
	});
	
	res.locals.user = instance;
	res.render('./users/edit');
	
});