var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,page = require('../../lib/controller')(app.servers.main, {
		 title: 'crosma.us'
		,require_auth: false
	})
;

	


page.handles('/', 'get', function(req, res, next) {
	var password = 'matt00';
	
	var start = process.hrtime();
	
	crypto.randomBytes(32, function(err, buf) {
		if (err) throw err;

		var salt = buf.toString('hex');

		crypto.pbkdf2(password, salt, 1000, 120, function(err, encodedPassword) {
			if (err) throw err;
			
			
			encodedPassword = Buffer(encodedPassword, 'binary').toString('hex');
			
			
			var end = process.hrtime();
			var delay = ((end[0] + end[1] / 1000000000) - (start[0] + start[1] / 1000000000)) + 's';
			console.log('Response Time: ' + delay + '\n');
			
			console.log(encodedPassword);
			console.log(encodedPassword.length);
			
			
			/*
			password = (encodedPassword.toString('hex')); // this line
			user.save(function(err, user) {
				if (!err) return res.send(err, 500);
				return res.json(user);
			});
			*/
		}.bind(this));
	});

	
	app.mysql.query('SELECT 1 + 1 + AS solution', function(err, rows, fields) {
		if (err) { next(err); return; }
		

		console.log('The solution is: ', rows[0].solution);
		
		res.render('index.jade');
	});

});
