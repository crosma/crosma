var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,tools = require('../../lib/tools')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Main'
	})
;


page.handles('/main', 'get', function(req, res, next) {
	res.render('main');
});

/*
		var post = new mdb.schema.Post;
		post.title = 'Test Post Title' + (new Date());
		post._poster = '4ffbddbd43d3a18427000001';
		//post.save();
*/