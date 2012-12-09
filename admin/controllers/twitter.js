var	 app = require('../../app')
	,util = require('util')
	,tools = require('../../lib/tools')
	,async = require('async')
	,chronicle = require('chronicle')
	,twit = require('twit')
	,page = require('../../lib/controller')(app.servers.admin, {
		title: 'Users'
	})
;

page.handles('/twitter', 'get', function(req, res, next) {
	console.log(app.config.twitter)

	var t = new twit(app.config.twitter)
	
	//track id on each tweet and use since since_id
	
	var twitter_account = 'duvalmagic'; //'GearboxSoftware';
	
	t.get('statuses/user_timeline', {screen_name: twitter_account, trim_user: true, include_entities: false},  function (err, reply) {
		if (err) console.log(err);
		
		reply.forEach(function(tweet) {
			var code = find_code(tweet.text);
			if (code) {
				res.write(util.inspect(tweet, false, 10));

				add_code(code, find_system(tweet.text), 'twitter', tweet.text, twitter_account, tweet.id_str, new Date(tweet.created_at));
			} else {
				//Not a match.
			}
		});
		
		//log newest twitter id here
		
		res.end();
	})

});

var code_regex = /((?:[A-Z0-9]{5})-(?:[A-Z0-9]{5})-(?:[A-Z0-9]{5})-(?:[A-Z0-9]{5})-(?:[A-Z0-9]{5}))/i;
function find_code(text)
{
	var match = code_regex.exec(text);
	
	if (match != null) {
		return match[0];
	} else {
		return false;
	}
}

var system_regex_pc = /(?:^|\s+)(pc|mac|computer)(?:\s+|^)/i;
var system_regex_xbox = /(?:^|\s+)(xbox|360|xbox360)(?:\s+|^)/i;
var system_regex_ps3 = /(?:^|\s+)(playstation|ps3)(?:\s+|^)/i;

function find_system(text)
{
	console.log('Looking: ' + text);

	if (system_regex_pc.exec(text)) {
		return 'pc';
	} else if (system_regex_xbox.exec(text)) {
		return 'xbox';
	} else if (system_regex_ps3.exec(text)) {
		return 'ps3';
	} else {
		return 'unknown';
	}
}

function add_code(code, system, source, source_text, source_account, source_message_id, source_message_dt)
{
	async.waterfall([
	function(callback){ //find existing code
	
		app.mysql.query_var(
			 'SELECT code_id FROM code WHERE code = :code'
			,{code: code}
			,callback
		);
	},
	
	function(code_id, callback){ //add if doesnt exist
		if (code_id) {
			console.log('Found ' + code_id);
			callback(null, code_id);
		} else {
			app.mysql.query(
				'INSERT INTO code SET code = :code, system = :system, created_dt = NOW()'
				,{code: code, system: system}
				,function(err, result) {
					if (err) {
						throw err;
					} else {
						console.log('Inserted ' + result.insertId);
					
						callback(err, result.insertId);
					}
				}
			);		
		}
	},
	
	function(code_id, callback){ //add source record
		app.mysql.query(
			'INSERT IGNORE INTO code_source SET code_id = :code_id, source = :source, source_text = :source_text, source_account = :source_account, source_message_id = :source_message_id, source_message_dt = :source_message_dt, created_dt = NOW()'
			,{
				 code_id: code_id
				,source: source
				,source_text: source_text
				,source_account: source_account
				,source_message_id: source_message_id
				,source_message_dt: source_message_dt
			}
			,callback
		);
	},
	
	], function (err, code_id) {
		if (err) throw err;
	
		console.log('Added code ' + code + ' from ' + source + '/' + source_account + '/' + source_message_id);
	});
}


