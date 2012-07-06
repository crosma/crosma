var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Purge Static Content'
	})
;

function setup(req, res, next)
{
	res.locals.the_file = '';
	res.locals.varnish = true;
	res.locals.cloudfront = true;
	
	next();
}

page.handles('/purge', 'get', setup, function(req, res, next) {
	res.render('purge.jade');
});

page.handles('/purge', 'purge_static', setup, function(req, res, next) {
	console.log(util.inspect(req.body));
	console.log(req.body.cloudfront);

	var the_file = req.body.the_file.trim();
	var varnish = req.body.varnish == 'yes';
	var cloudfront = req.body.cloudfront == 'yes';

	if (!the_file)
	{
		res.err('You need to specify a file to purge.');
	}
	else if (!varnish && !cloudfront)
	{
		res.err('Don\'t really want to purge anything I guess...');
	}
	else
	{
		if (varnish)
		{
			res.msg('Sent purge request for "' + the_file + '" to Varnish.');
		}
		
		if (cloudfront)
		{
			res.msg('Sent invalidation request for "' + the_file + '" to CloudFront.');
		}
	}

	res.locals.the_file = the_file;
	res.locals.varnish = varnish;
	res.locals.cloudfront = cloudfront;
	
	res.render('purge.jade');
})

page.handles('/purge', 'purge_views', setup, function(req, res, next) {

	for (var s in app.servers) {
		console.log(s + ' = ' + app.servers[s]);
		app.servers[s].cache = {};
	}

	res.msg('View caches for all servers have been cleared.');
	
	res.err('This doesn\'t seem to actually work.');
	
	res.render('purge.jade');
});

page.handles('/purge', 'change_static', setup, function(req, res, next) {
	var shasum = crypto.createHash('sha1');
	shasum.update((new Date()).getTime().toString());
	
	app.config.unique = 'v' + shasum.digest('hex').substr(0, 8);
	
	res.msg('Static version changed.');
	
	res.err('Also does not work as versionator doesn\'t account for changing it.');
	
	res.render('purge.jade');
});