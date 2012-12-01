var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,tools = require('../../lib/tools')
	,page = require('../../lib/controller')(app.servers.main, {
		 title: 'crosma.us'
		,require_auth: false
	})
;


page.handles('/', 'get', function(req, res, next) {
	res.render('index.jade');
	
	
	/*
	tools.createPassword(password, function(salt, encodedPassword) {
		app.mysql.query(
			'INSERT INTO user SET email = :email, password_hashed = :password, password_salt = :salt, name = :name, created_dt = :created_dt'
			,{email: 'vbaspcppguy@gmail.com', password: encodedPassword, salt: salt, name: 'Matt C', created_dt: tools.timestamp()}
			,function(err, result) {
				if (err) { next(err); return; }
				

				console.log(result.insertId);
				
				res.render('index.jade');
			}
		);
		
		
		
	});
	*/
});