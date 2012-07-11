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
	var counts = [];

	async.parallel([
		function(callback){
			mdb.schema.User.count({}, function (err, count) {
				counts.push(['User', count]);
				callback(err);
			});
		},
		function(callback){
			mdb.schema.Post.count({}, function (err, count) {
				counts.push(['Post', count]);
				callback(err);
			});
		},
	],
	function(err, results) {
		counts.sort(function(a, b) {return a[1] > b[1]});
	
		res.locals.counts = counts;
		res.render('mongo');
	});
	
});