var Client = require('mariasql');
var inspect = require('util').inspect;
var timer = require('./lib/timer');

var c = new Client();
c.connect({
	host: '127.0.0.1',
	port: 3306,
	user: 'matt',
	password: 'dfmshndfgsdfsdf',
	database: 'crosma'
});


for (i=1; i<=5; i++) {
	var r = Math.random();

	var t = new timer(r);

	c.query("select 1+"+r+" as qqq")
	.on('result', function(res) {
		res.on('row', function(row) {
			console.log('Result row: ' + inspect(row));
		})
		.on('error', function(err) {
			console.log('Result error: ' + inspect(err));
		})
		.on('end', function(info) {
			console.log('Result finished successfully');
		});
	})
	.on('end', function() {
		t.end();
		console.log('Done with all results');
	});

}
