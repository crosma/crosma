var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mongoose = require('mongoose')
	,Schema = mongoose.Schema
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'MongoDB Testing'
	})
;


mongoose.connect('mongodb://cromsa.us/crosma', function(err) {
	console.error('Error connecting.');
	console.error(err);
});

var User = new Schema({
	name: {
		 first: String
		,last : String
	}
	,email: { type: String, required: true, index: { unique: true, sparse: true } }
	,alive: Boolean
});

User.statics.findByEmail = function (email, callback) {
	return this.find({email: email}, callback);
}

var UserModel = mongoose.model('User', User);


page.handles('/mongo', 'get', function(req, res, next) {


	console.log(util.inspect(UserModel, false, 3, true));
	
	/*
	
	var instance = new UserModel();
	instance.name.first = 'Matt';
	instance.name.last = 'Crossley';
	instance.email = 'hello@overthere.com';
	instance.alive = true;
	instance.save(function (err) {
		console.error(err);
	});
	
	
	
	console.log(instance.toJSON());
	*/
	
	//console.log(util.inspect(instance, false, 3, true));
	
	
	

	res.locals.mongo = '';
	res.render('mongo.jade');
});