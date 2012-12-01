var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,myutils = ('../../lib/myutils')
	,page = require('../../lib/controller')(app.servers.main, {
		 title: 'crosma.us'
		,require_auth: false
	})
;

console.log(myutils);


var fs = require('fs');
//console.log(fs.realpathSync('lib/controller'));


page.handles('/', 'get', function(req, res, next) {
	var password = 'matt003rt3545345345345345353245fvas4(*&%)%*';
	
	
	
	console.log(myutils);
	
	console.log('---' + myutils.bah);
	
	myutils.createPassword(function(salt, pass) {
		console.log(salt);
		console.log(pass);
	});
	
	/*
	app.mysql.query('SELECT 1 + 1 + AS solution', function(err, rows, fields) {
		if (err) { next(err); return; }
		

		console.log('The solution is: ', rows[0].solution);
		
		res.render('index.jade');
	});
	*/
});
