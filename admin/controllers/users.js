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
		.asc('name.last', 'name.first')
	;
	
	query.run(function (err, users) {
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

page.handles('/user/:id/edit', 'get', function(req, res, next) {
	//console.log(util.inspect(UserModel, false, 3, true));
	
	//if ()

	schema.User.findByEmail('vbaspcppguy@gmail.com').exec(function (err, user) {
		if (err)
		{
			res.err('Can\'t find user...');
		}
		else
		{
			console.log(user);
		}
		
		res.render('./users/list');
	});

	
});

page.handles('/user/:id/edit', 'post', function(req, res, next) {
	//console.log(util.inspect(UserModel, false, 3, true));
	

	var instance = new schema.User;
	instance.name.first = 'Matt';
	instance.name.last = 'Crossley';
	instance.email = 'vbaspcppguy@gmail.com';
	instance.password_hashed = 'test';
	
	instance.save(function (err) {
		if (err)
		{
			res.err('<b>Error saving user:</b> ' + err);
		}
		else
		{
			res.msg('User saved.');
		}
		 
		res.render('./users/list');
	});
});