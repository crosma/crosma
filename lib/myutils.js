var	 util = require('util')
	,crypto = require('crypto')
;

module.exports = {bah: 'ha'};

function createPassword(password, callback) {
	crypto.randomBytes(240, function(err, buf) {
		if (err) throw err;

		var salt = buf.toString('hex');

		crypto.pbkdf2(password, salt, 1000, 120, function(err, encodedPassword) {
			if (err) throw err;

			encodedPassword = Buffer(encodedPassword, 'binary').toString('hex');
			
			callback(salt, password);
			/*
			var end = process.hrtime();
			var delay = ((end[0] + end[1] / 1000000000) - (start[0] + start[1] / 1000000000)) + 's';
			console.log('Response Time: ' + delay + '\n');
			console.log(encodedPassword);
			console.log(encodedPassword.length);
			*/
		}.bind(this));
	});
};
module.exports.createPassword = createPassword;