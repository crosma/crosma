var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mongoose = require('mongoose')
	,Schema = mongoose.Schema
;


var User = new Schema({
	name: {
		 first: {
			 type: String
			,trim: true
		}
		,last : {
			 type: String
			,trim: true
		}
	}
	
	,email: {
		 type: String
		,required: true
		,trim: true
		,set: function(v) {
			this.set('email_lower', v.toLowerCase());
			
			return v;
		}
	}	
	
	,email_lower: {
		 type: String
		,required: true
		,trim: true
		,lowercase: true
		,index: {unique: true, sparse: true}
	}
	
	,password: {
		 type: String
		,required: true
		,set: function(v){
			this.set('password_type',  1); //Set to sha1 type
		
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


//Index names so sorting is quicker
User.index({'name.first': 1, 'name.first': 1});

//Short name maker
User.virtual('name.abbr').get(function() {
	return this.name.first + ' ' + this.name.last[0].toUpperCase() + '.';
});


//Password check function
User.methods.authenticate = function (plaintext) {
	if (this.password_type == 2) {
		throw new Error('User ' + this.email + ' bcrypt password is set...');
		
	} else if (this.password_type == 1) {
		return this.password === crypto.createHash('sha1').update(this.password_salt + plaintext).digest('hex');
	}
}

User.statics.findUnique = function (who, cb) {
	if (who.indexOf('@') >= 0) {
		return this.findOne({email_lower: who.toLowerCase()}).exec(cb);
		
	} else if (/^[A-Fa-f0-9]{24}$/.test(who)) {
		var test = this.findById(who, cb);

	} else {
		return cb(null, null);
	}
}


module.exports = mongoose.model('User', User);