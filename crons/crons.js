var	 app = require('../app')
	,cronJob = require('cron').CronJob
;

console.log('Crons!');

var cron_tasks = [
	{
		 name: 'twitter'
		,cronTime: '*/1 * * * *'
		,func: require('./tasks/twitter.task')
		,start: false
	}
];

module.exports.tasks = cron_tasks;

cron_tasks.forEach(function(task) {
	
	task.run_func = function() {
		app.debug('Task "' + task.name + "' started at " + (new Date()));
		
		task.last_started = new Date();
		
		task.func();
	};
	
	task.job = new cronJob(task.cronTime, task.run_func, null, task.start);
});