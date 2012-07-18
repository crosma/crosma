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
	var type = req.header['x-amz-sns-message-type'] || '';
	var arn = req.header['x-amz-sns-topic-arn'] || '';
	
	console.log('--------------------------------------------------');
	console.log(util.inspect(req.headers));
	console.log('--------------------------------------------------');
	console.log(util.inspect(body));
	console.log('--------------------------------------------------');
	
	
	if (type == 'Notification') {
	
	} else if (type == 'SubscriptionConfirmation') {
		console.log('~~~' + body.SubscribeURL);
	
	} else if (type == 'UnsubscribeConfirmation') {
	
	
	} else {
		//Wut?
	}
	
	//next();
}

page.handles('/aws/sns', 'POST', incomming);