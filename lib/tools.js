var	 util = require('util')
	,crypto = require('crypto')
;

module.exports = {};

module.exports.createPassword = function(password, callback) {
	crypto.randomBytes(120, function(err, buf) {
		if (err) throw err;

		var salt = buf.toString('hex');

		crypto.pbkdf2(password, salt, 1000, 120, function(err, encodedPassword) {
			if (err) throw err;
			
			encodedPassword = Buffer(encodedPassword, 'binary').toString('hex');
			
			callback(null, salt, encodedPassword);
		}.bind(this));
	});
};

module.exports.checkPassword = function(user_text, hashed, salt, callback) {
	crypto.pbkdf2(user_text, salt, 1000, 120, function(err, encodedPassword) {
		if (err) throw err;

		encodedPassword = Buffer(encodedPassword, 'binary').toString('hex');
		
		callback(null, hashed == encodedPassword);
	}.bind(this));

};

module.exports.timestamp = function() {
	return (new Date()).getTime();
};