var	 app = require('../../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mdb = require('mongoose')
	,https = require('https')
	,url = require('url')
	,page = require('../../../lib/controller')(app.servers.admin, {
		 title: 'AWS SNS Incomming'
		,require_auth: false
	})
;

function incomming(req, res, next) {
    var data='';
    req.setEncoding('utf8');
	

    req.on('data', function(chunk) { 
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
		
		handle(JSON.parse(data), req, res, next);
    });
}

function handle(body, req, res, next) {
	console.log('--------------------------------------------------');
	console.log(util.inspect(req.headers));
	console.log('--------------------------------------------------');
	console.log(util.inspect(body));
	console.log('--------------------------------------------------');

	if (body.Type == 'Notification') {
	
	} else if (body.Type == 'SubscriptionConfirmation') {
		console.log('Subscribing to ' + body.TopicArn);
		console.log('body.SubscribeURL = ' + body.SubscribeURL);
		
		var options = url.parse(body.SubscribeURL);
		/*
		var options = {
			hostname: u.hostname,
			port: 443,
			path: '/',
			method: 'GET'
		};
		*/

		var the_req = https.request(options, function(res) {
			//https.get(body.SubscribeURL, function(the_res){
			console.log("statusCode: ", res.statusCode);
			console.log("headers: ", res.headers);

			the_res.on('data', function(d) {
				process.stdout.write(d);
			});
		  
		}).on('error', function(e) {
			console.error(e);
		});
		
	} else if (body.Type == 'UnsubscribeConfirmation') {
	
	
	} else {
		//Wut?
	}
	
	//Tell amazon that we are good. 
	res.status(200).send('Ok');
}

page.handles('/aws/sns', 'POST', incomming);