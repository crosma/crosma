var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mdb = require('mongoose')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Main'
	})
;


page.handles('/main', 'get', function(req, res, next) {
	var query = mdb.schema.Post
		.find({})
		.sort('date', 1)
		.populate('_poster', ['name'])
	;
	
	query.exec(mdb.handler(req, res, function (posts) {
		res.locals.posts = posts;
		
		res.render('main');
	}));
});

/*
		var post = new mdb.schema.Post;
		post.title = 'Test Post Title' + (new Date());
		post._poster = '4ffbddbd43d3a18427000001';
		//post.save();
*/