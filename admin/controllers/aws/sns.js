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
	
	console.log('--------------------------------------------------');
	console.log(util.inspect(req.headers));
	console.log('--------------------------------------------------');
	console.log(util.inspect(req.body));
	console.log('--------------------------------------------------');
	
    req.on('data', function(chunk) { 
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
		
		console.log(data);
		
        next();
    });
}

function ugh(req, res, next) {
	var type = req.header['x-amz-sns-message-type'] || '';
	var arn = req.header['x-amz-sns-topic-arn'] || '';
	
	res.send('Ok');
	
	if (type == 'Notification') {
	
	} else if (type == 'SubscriptionConfirmation') {
	
	
	} else if (type == 'UnsubscribeConfirmation') {
	
	
	} else {
		//Wut?
	}
	
	//next();
}

page.handles('/aws/sns', 'POST', incomming);