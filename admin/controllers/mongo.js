var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mongoose = require('mongoose')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'MongoDB Testing'
	})
;

page.handles('/mongo', 'get', function(req, res, next) {


	//console.log(util.inspect(schema, false, 3, true));
	
	/*
	var instance = new schema.User;
	instance.name.first = 'Some';
	instance.name.last = 'Guy';
	instance.email = 'test@two.com';
	instance.alive = true;
	instance.save(function (err) {
		console.error('Error Saving.');
		console.error(err);
	});
	*/
	
	//console.log(instance.toJSON());

	
	//console.log(util.inspect(instance, false, 3, true));
	
	
	

	res.locals.mongo = '';
	res.render('mongo.jade');
});