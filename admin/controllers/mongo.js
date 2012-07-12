var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mongoose = require('mongoose')
	,mdb = require('mongoose')
	,async = require('async')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'MongoDB Testing'
	})
;

page.handles('/mongo', 'get', function(req, res, next) {
	var cnt = 1;
	
	var queries = {};
	
	for (i=1; i<=1; i++) {
		queries['User-' + i] = function(callback){ mdb.schema.User.where('name.first').gte(i).count(callback); };
		queries['Post-' + i] =  function(callback){ mdb.schema.Post.where('title').gte(i).count(callback); }
	}
	
	async.parallel(queries, function(err, results) {
		var counts = [];
		
		for (var c in results) {
			counts.push([c, results[c]])
		}
		
		counts.sort(function(a, b) { return a[0] > b[0] });
	
		res.locals.counts = counts;
		res.render('mongo');
	});
	
});