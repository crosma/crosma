//var Client = require('mariasql');
var inspect = require('util').inspect;
var timer = require('./lib/timer');

/*
var c = new Client();
c.connect({
	host: '127.0.0.1',
	port: 3306,
	user: 'matt',
	password: 'dfmshndfgsdfsdf',
	database: 'crosma'
});


function meh()
{
	var r = Math.random();

	var t = new timer(r);
	var dsfsdf = Math.random();
	t.end();

	t = new timer(r);

	c.query("select 1+"+r+" as qqq")
	.on('result', function(res) {
		res.on('row', function(row) {
			//console.log('Result row: ' + inspect(row));
		})
		.on('error', function(err) {
			//console.log('Result error: ' + inspect(err));
		})
		.on('end', function(info) {
			t.end('res');
			//console.log('Result finished successfully');
		});
	})
	.on('end', function() {
			t.end('all');
		//console.log('Done with all results');
	});
}
*/


var redis = require("redis"),
	client = redis.createClient(6379, 'real.crosma.us');

client.auth('kjhgHGJHG&6759G^%G*&%HG*&');

function meh()
{

	// if you'd like to select database 3, instead of 0 (default), call
	// client.select(3, function() { /* ... */ });

	client.on("error", function (err) {
		console.log("Error " + err);
	});

	var r = Math.random();
	var t = new timer(r);

	client.set("string key", "string val", function () {
		t.end('all');
	});
	//client.hset("hash key", "hashtest 1", "some value", redis.print);
	//client.hset(["hash key", "hashtest 2", "some other value"], redis.print);

}

for (i=1; i<=5; i++)
{
	meh();
}