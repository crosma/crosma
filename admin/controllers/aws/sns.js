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
	console.log('POST--------------------------------------------------');
	console.log(util.inspect(req.headers));
	console.log('POST--------------------------------------------------');
	console.log(util.inspect(body));
	console.log('POST--------------------------------------------------');

	if (body.Type == 'Notification') {
	
	} else if (body.Type == 'SubscriptionConfirmation') {
		var options = url.parse(body.SubscribeURL);

		var the_req = https.request(options, function(the_res) {
			the_res.on('data', function(d) {
				process.stdout.write(d);
			});
		}).on('error', function(e) {
			console.error('ERROR SUBCRIBING TO SNS');
			console.error(e);
		}).end();
		
	} else if (body.Type == 'UnsubscribeConfirmation') {
	
	
	} else {
		//Wut?
	}
	
	//Tell amazon that we are good. 
	res.status(200).send('Ok');
}

page.handles('/aws/sns', 'POST', incomming);


page.handles('/aws/sns', 'GET', function(req, res, next) {
	console.log('GET--------------------------------------------------');
	console.log(util.inspect(req.headers));
	console.log('GET--------------------------------------------------');
});