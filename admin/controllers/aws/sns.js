var	 app = require('../../../app')
	,util = require('util')
	,crypto = require('crypto')
	,mdb = require('mongoose')
	,page = require('../../../lib/controller')(app.servers.admin, {
		 title: 'AWS SNS Incomming'
		,require_auth: false
	})
;


function ugh(req, res, next) {
	var type = req.header['x-amz-sns-message-type'] || '';
	var arn = req.header['x-amz-sns-topic-arn'] || '';
	
	
	console.log('--------------------------------------------------');
	console.log(util.inspect(req.header));
	console.log('--------------------------------------------------');
	console.log(util.inspect(req.body));
	console.log('--------------------------------------------------');
	
	res.send('Ok');
	
	if (type == 'Notification') {
	
	} else if (type == 'SubscriptionConfirmation') {
	
	
	} else if (type == 'UnsubscribeConfirmation') {
	
	
	} else {
		//Wut?
	}
	
	//next();
}

page.handles('/aws/sns', 'GET', ugh);
page.handles('/aws/sns', 'POST', ugh);