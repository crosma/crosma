console.log('---------------------------------------------');
console.log('---------------------------------------------');
console.log('---------------------------------------------');

var config = module.exports.config = require('./config');


/******************************************************************************
********* Set up globals
******************************************************************************/
var  express = require('express')
	,assert = require('assert')
	,app = module.exports.express = express()
	,fs = require('fs')
	,crypto = require('crypto')
	,shasum = crypto.createHash('sha1')
	,util = require('util')
	,colorize = require('colorize')
	,chronicle = require('chronicle')
	,socketio = require('socket.io')
	,redis = require('redis')
;


/******************************************************************************
********* Basic little crap
******************************************************************************/
module.exports.servers = {};

//add gray to the colors of colorize. Nowhere else for this really
colorize.ansicodes['gray'] = '\033[90m';


/******************************************************************************
********* Set up app wide logging
******************************************************************************/
module.exports.log = function(text) {
	console.log(colorize.ansify('#cyan[' + text + ']'));
};
module.exports.debug = function(text) {
	console.log(colorize.ansify('#green[' + text + ']'));
};
module.exports.alert = function(text) {
	console.log(colorize.ansify('#red[' + text + ']'));
};

/******************************************************************************
********* Handle unhandled errors
******************************************************************************/
if (!process.listeners('uncaughtException')) {
	process.on('uncaughtException', function (e) {
		console.error(e && e.stack ? e.stack : e);
	});
}


/******************************************************************************
********* Process handling... not yet
******************************************************************************/
/*
process.on("uncaughtException", function(err) {
  console.error("[uncaughtException]", err);
  console.error(err.stack);
  return process.exit(1);
});
*/



/******************************************************************************
********* Set up chronicle and static files in config
******************************************************************************/
chronicle.setup({
	basepath: config.root + config.static_dir
});


exports.staticize = function(url) {
	return chronicle.chronicle(config.static_url + url);
};

config.local_css_files = config.local_css_files.map(exports.staticize);
config.local_js_files = config.local_js_files.map(exports.staticize);

/*
for (i=0; i<app.config.local_js_files.length; i++) {
	app.config.local_js_files[i] = chronicle.chronicle(app.config.static_url + app.config.local_js_files[i]);
}
*/


/******************************************************************************
********* Set up mongoose
******************************************************************************/
/*
var mongoose = require('mongoose');

mongoose.schema = require('./lib/mongodb/schema');

mongoose.handler = function CreateHandler(req, res, cb)
{
	var hnd = function(err, result) {
		if (err) {
			console.log('---Mongo---' + err + '---Mongo---');
			throw Error('MongoDB Error: ' + err);
		} else {
			cb(result);
		}
	}
	
	return hnd;
};


var mongoose_uri = 'mongodb://' + config.mongodb.user + ':' + config.mongodb.pass + '@' + config.mongodb.address + ':' + config.mongodb.port + '/' + config.mongodb.db;
mongoose.connect(mongoose_uri, function(err) {
	if (err) {
		console.error('Error connecting to MongoDB');
		console.error(err);
	} else {
		console.log('Connected to MongoDB');
	}
});
*/


/******************************************************************************
********* Set up mysql
******************************************************************************/
var mysql = require('mysql');
var mysql_uri = 'mysql://' + config.mysql.user + ':' + config.mysql.pass + '@' + config.mysql.address + ':' + config.mysql.port + '/' + config.mysql.db;

function createMysqlConnection()
{
	exports.mysql = mysql.createConnection(mysql_uri);
	
	//This causes it to try to reconnect automaticly.
	exports.mysql.on('error', function(err) {
		if (!err.fatal) {
			return;
		}

		if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err;
		}
		
		console.log('MySQL reconnecting: ' + err.stack);

		setTimeout(createMysqlConnection, 100); //limit how fast it can retry for safety
	});
	
	exports.mysql.real_query = exports.mysql.query;
	
	//Wrap the query function to add the sql to the error
	exports.mysql.query = function(sql, values, callback) {
		//could also use this to time queries?
		
		exports.mysql.real_query(sql, values, function(err, rows, fields) {
			if (err) {
				err.query = sql;
			}
			
			callback(err, rows, fields);
		});
	};
	
	//Return a single row from a query
	exports.mysql.query_row = function(sql, values, callback) {
		exports.mysql.query(sql, values, function(err, rows, fields) {
			var row = null;
			if (rows.length > 1) {
				throw "mysql.query_row() got more than one row. LIMIT that shit.";
			} else if (rows.length == 1) {
				row = rows[0];
			}
			
			callback(err, row, fields);
		});
	};
	
	//return the first value from the first row
	exports.mysql.query_var = function(sql, values, callback) {
		exports.mysql.query(sql, values, function(err, rows, fields) {
			var val = null;
			if (rows.length > 1) {
				throw "mysql.query_row() got more than one row. LIMIT that shit.";
			} else if (rows.length == 1 && rows[0].length > 1) {
				throw "mysql.query_row() got more than one row. LIMIT that shit.";
			} else if (rows.length == 1 && rows.length == 1) {
				val = rows[0][fields[0].name];
			}
			
			callback(err, val);
		});
	};
	
	//quick FOUND_ROWS() function
	exports.mysql.query_found_rows = function(callback) {
		exports.mysql.query_var('SELECT FOUND_ROWS()', {}, function(err, count) {
			callback(err, count);
		});
	};
	
	//quick ROW_COUNT() function
	exports.mysql.query_row_count = function(callback) {
		exports.mysql.query_var('SELECT ROW_COUNT()', {}, function(err, count) {
			callback(err, count);
		});
	};
	
	//customize how values are interpolated in the sql
	exports.mysql.format = function (query, values) {
		if (!values) return query;
		return query.replace(/\:(\w+)/g, function (txt, key) {
			if (values.hasOwnProperty(key)) {
				return this.escape(values[key]);
			}
			return txt;
		}.bind(this));
	};
	
	//hey, hey, lets go
	exports.mysql.connect(function(err) {
		if (err) {
			console.error('Error connecting to MySQL');
			console.error(err);
		} else {
			console.log('Connected to MySQL');
		}
	});
	

}

createMysqlConnection();


/******************************************************************************
********* Set up dev logger format
******************************************************************************/
express.logger.format('mydev', function(tokens, req, res){
	var 
		 status = res.statusCode
		,color = 'green'
		,remote = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for'] || tokens['remote-addr'](req, res)
		,referer = req.headers['referer']
		,vhost = req.vhost_for_logger
	;
	
	if (status >= 500) color = 'red'
	else if (status >= 400) color = 'yellow'
	else if (status >= 300) color = 'cyan';
	

	return colorize.ansify(
		  '#gray['
		+ '#white[' + vhost + ']'
		+ ' | ' + (new Date().toISOString())
		+ ' | ' + remote
		+ ' | ' + req.method
		+ ' | #blue[' + req.headers.host + ']'
		+ ' | #cyan[' + req.originalUrl + ']'
		+ ' | #' + color + '[' +  + res.statusCode + ']'
		+ ' | ' + (new Date - req._startTime) + 'ms'
		+ ']'
	);
});


/******************************************************************************
********* start listening and get the http object returned
******************************************************************************/
var http_server = app.listen(config.port);


/******************************************************************************
********* Start up socket.io
******************************************************************************/
var io = socketio.listen(http_server)
	,RedisStore = require('socket.io/lib/stores/redis')
;

var pub = redis.createClient(config.redis.port, config.redis.address);
pub.auth(config.redis.pass, function(){});

var sub = redis.createClient(config.redis.port, config.redis.address);
sub.auth(config.redis.pass, function(){});

var client = redis.createClient(config.redis.port, config.redis.address);
client.auth(config.redis.pass, function(){});

io.set('store', new RedisStore({
	 redisPub: pub
	,redisSub: sub
	,redisClient: client
}));

io.set('resource', '/io');
io.set('log level', 2);
io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);


/******************************************************************************
********* set up the static content vhost
******************************************************************************/
module.exports.servers.static = require('./vhosts/static');


/******************************************************************************
********* set up the admin vhost
*******************************************(**********************************/
module.exports.servers.admin = require('./admin/admin.vhost');
module.exports.servers.admin.boot(io);


/******************************************************************************
********* set up the main vhost
********* should be the last before the catchall.
******************************************************************************/
module.exports.servers.main = require('./main/main.vhost');
module.exports.servers.main.boot(io);


/******************************************************************************
********* set up the catchall redirect
******************************************************************************/
module.exports.servers.catchall = require('./vhosts/catchall');


/******************************************************************************
********* Go go go go go
******************************************************************************/
var crons = require('./crons/crons');
 
/******************************************************************************
********* Go go go go go
******************************************************************************/
app.use(express.errorHandler({dumpExceptions: true, showStack: true}));



console.log('NODE_ENV = ' + process.env.NODE_ENV + ', Port ' + config.port);