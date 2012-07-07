var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mongoose = require('mongoose')
	,Schema = mongoose.Schema
;


var User = new Schema({
	name: {
		 first: String
		,last : String
	}
	
	,email: {
		 type: String
		,required: true
		,set: function(v) {
			this.email_lower = v.toLowerCase();
			
			return v;
		}
	}	
	
	,email_lower: {
		 type: String
		,required: true
		,index: {unique: true, sparse: true}
	}
	
	,password: {
		 type: String
		,required: true
		,set: function(v){
			this.password_type = 1; //Set to sha1 type
		
			return crypto.createHash('sha1').update(this.password_salt + v).digest('hex');
		}
	}
	
	,password_type: {
		 type: Number //0: None, 1: sha1, 2: bcrypt
		,default: 0
	}
	
	,password_salt: {
		 type: String
		,required: true
		,default: function() {
			return 'hg&^GH' + (new Date().valueOf() * Math.random());
		}
	}
	
	,registered_date: {
		 type: Date
		,default: function(){
			return new Date()
		}
		,set: function(v){
			return v == 'now' ? new Date() : v;
		}
	}
});

	
User.methods.authenticate = function (plaintext) {
	if (this.password_type == 2)
	{
		throw new Error('User ' + this.email + ' bcrypt password is set...');
	}
	else if (this.password_type == 1)
	{
		return this.password === crypto.createHash('sha1').update(this.password_salt + plaintext).digest('hex');
	}
}

module.exports = mongoose.model('User', User);