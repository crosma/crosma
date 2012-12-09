var	 app = require('../../app')
	,crons = require('../../crons/crons')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Cron Tasks'
	})
;

page.handles('/crons', 'get', function(req, res, next) {
	res.locals.breadcrumbs.push({text: 'Crons', href: '/crons'});
	res.locals.tasks = crons.tasks;
	
	res.render('./crons'); 
});

page.handles('/crons/:name/run', 'get', function(req, res, next) {
	var ran = false;

	crons.tasks.forEach(function(task){
		if (task.name == req.params.name) {
			res.msg('Started task "' + req.params.name + '" at ' + (new Date()));
			task.run_func();
			
			ran = true;
		}
	});
	
	if (!ran) {
		res.err('Task "' + req.params.name + '" not found.');
	}
	
	//redirect, will make it so you can't accidentally refresh and run again
	res.redirect('/crons'); 
});
