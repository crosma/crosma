var	 app = require('../../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mdb = require('mongoose')
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
		
		http.get(body.SubscribeURL, function(res){});
		
	} else if (body.Type == 'UnsubscribeConfirmation') {
	
	
	} else {
		//Wut?
	}
	
	//Tell amazon that we are good. 
	res.status(200).send('Ok');
}

page.handles('/aws/sns', 'POST', incomming);