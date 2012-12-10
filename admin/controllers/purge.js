var	 app = require('../../app')
	,util = require('util')
	,crypto = require('crypto')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Purge Static Content'
	})
;

function setup(req, res, next)
{
	res.locals.breadcrumbs.push({text: 'Purge Caches'});
	res.locals.the_file = '';
	res.locals.varnish = true;
	res.locals.cloudfront = true;
	
	next();
}

page.handles('/purge', 'get', setup, function(req, res, next) {
	res.render('purge');
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
	
	res.render('purge');
})

page.handles('/purge', 'purge_views', setup, function(req, res, next) {
	require('jade').cache = {};
	
	res.msg('View cache has been cleared.');
	
	res.render('purge');
});


page.handles('/purge', 'purge_chronicle', setup, function(req, res, next) {
	require('chronicle').clearCache();
	
	res.msg('Chronicle has been cleared.');
	
	res.render('purge');
});