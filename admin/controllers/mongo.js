var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mongoose = require('mongoose')
	,mdb = require('mongoose')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'MongoDB Testing'
	})
;

page.handles('/mongo', 'get', function(req, res, next) {

	var counts = [];

	mdb.schema.User.count({}, mdb.handler(req, res, function (count) {
		counts.push(['User', count]);
		
		mdb.schema.Post.count({}, mdb.handler(req, res, function (count) {
			counts.push(['Post', count]);
			
			counts.sort(function(a, b) {return a[1] > b[1]});
			
			
			res.locals.counts = counts;
			res.render('mongo');
		}));
	}));
	
});