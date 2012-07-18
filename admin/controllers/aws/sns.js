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
	
	console.log('Ok');
	
	//console.log(util.inspect(req));
	
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