var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,tools = require('../../lib/tools')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Main'
	})
;

function middleware1(req, res, next)
{
	console.log("middleware1");
	next();
}
function middleware2(req, res, next)
{
	console.log("middleware1");
	next();
}

page.handles('/main', 'get', function(req, res, next) {
	res.msg("Ain't nothin' here.");

	res.locals.breadcrumbs.push({text: 'Main', href: '/main'});
	res.locals.breadcrumbs.push({text: 'Whore', href: '/bag'});
	//res.render('main');
	
	res.locals.random = Math.random();
	
	res.render('test.ect');
});

/*
		var post = new mdb.schema.Post;
		post.title = 'Test Post Title' + (new Date());
		post._poster = '4ffbddbd43d3a18427000001';
		//post.save();
*/