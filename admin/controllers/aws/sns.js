var	 app = require('../../../app')
	,util = require('util')
	,crypto = require('crypto')
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
	res.send('Ok');
}

page.handles('/aws/sns', 'POST', incomming);
//page.handles('/aws/sns', 'GET', incomming);


page.handles('/aws/sns', 'GET', function(req, res, next) {
	console.log('GET--------------------------------------------------');
	console.log(util.inspect(req.headers));
	console.log('GET--------------------------------------------------');
	
	res.status(200).send('Y U GET!?');
});

/*
{ 
  Type: 'Notification',
  MessageId: '0c8c27a2-9dd3-41d6-b8ff-67eeaad39251',
  TopicArn: 'arn:aws:sns:us-east-1:718947911325:cromsa_ses',
  
Message: '{
	"notificationType": "Bounce"
	,"bounce": {
		"bounceType": "Transient"
		,"reportingMTA": "dns; a192-6.smtp-out.amazonses.com"
		,"bouncedRecipients": [
			{
				 "emailAddress": "cock@dickbag.com"
				,"status": "5.0.0"
				,"action": "failed"
				,"diagnosticCode": "smtp; 5.1.0 - Unknown address error 550-\'Relaying not allowed\' (delivery attempts: 0)"
			}
		]
		,"bounceSubType": "General"
		,"timestamp": "2012-07-18T09:52:26.000Z"
		,"feedbackId": "00000138997f8f28-19189316-d0be-11e1-a882-2102c4038842-000000"
	}
	,"mail": {
		"timestamp": "2012-07-18T09:51:06.000Z"
		,"source": "matt@crosma.us"
		,"messageId": "00000138997f8124-197116cd-4207-496f-afe9-b58b5bd1a4c9-000000"
		,"destination": ["cock@dickbag.com"]
	}
}',
  
  Timestamp: '2012-07-18T09:51:10.412Z',
  SignatureVersion: '1',
  Signature: 'gQaDr73RLVJhuUjGiTE7UrlTov+hqmrG8Zxt0FAuPHy2q1bEX0sYFfAEqSBsGbvmfYOcCAisTcsqRO1JSHrBS+LLDF3fNygFWFW3y0fm45GMkXJGX6TuakdHpA3t0os49C5ssfVjxxfbK/JUlbnpe11oQXgP2YvLDmzEULy2EoI=',
  SigningCertURL: 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem',
  UnsubscribeURL: 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:718947911325:cromsa_ses:1b36a6e8-d8bd-4d53-a9c3-49e5370bd0fa'
}



{ Type: 'Notification',
  MessageId: '531c4002-92cd-4534-8561-2ecb310d74e7',
  TopicArn: 'arn:aws:sns:us-east-1:718947911325:cromsa_ses',
  
Message: '{
	"notificationType":"Bounce"
	,"bounce":{
		"bounceType":"Transient"
		,"reportingMTA":"dns; na-mm-outgoing-5102-bacon.iad5.amazon.com"
		,"bouncedRecipients": [
			{
				"emailAddress":"sdfasdfdf@kjjkgfsgdfsdfg.com"
				,"status":"5.0.0"
				,"action":"failed"
				,"diagnosticCode":"smtp; 5.1.2 - Bad destination host \'DNS Hard Error looking up kjjkgfsgdfsdfg.com (MX):  NXDomain\' (delivery attempts: 0)"
			}
		]
		,"bounceSubType":"General"
		,"timestamp":"2012-07-18T10:09:11.000Z"
		,"feedbackId":"0000013899900dc3-9d692fc3-d0c0-11e1-827f-0743ea227078-000000"
	}
	,"mail": {
		"timestamp":"2012-07-18T10:09:08.000Z"
		,"source":"dasfsdf@crosma.us"
		,"messageId":"0000013899900200-e0358864-60e5-40ca-a8fd-8bc816b5f904-000000"
		,"destination"["sdfasdfdf@kjjkgfsgdfsdfg.com"]
	}
}',
 

 Timestamp: '2012-07-18T10:09:11.339Z',
  SignatureVersion: '1',
  Signature: 'NVpNsgPlg4a3YiYtpLkcq9D+PdEa0hXO2bKzqZm6/hR/NmsOUQAZ/4Kh+egnylpCthRIqUH977GXFdQPnhJCkQzTYFKqwm91NgvitTLPFhe33onp/IOm9ZvvDqrX2JVN/82gR58zxEbS9Rf3KKN5JGpkYvixdD7j/0LU8oo3klI=',
  SigningCertURL: 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-f3ecfb7224c7233fe7bb5f59f96de52f.pem',
  UnsubscribeURL: 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:718947911325:cromsa_ses:1b36a6e8-d8bd-4d53-a9c3-49e5370bd0fa' }


*/

