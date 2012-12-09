var  generic_pool = require('generic-pool')
	,mysql = require('mysql')
	,config = require('../config')
;

var mysql_uri = 'mysql://' + config.mysql.user + ':' + config.mysql.pass + '@' + config.mysql.address + ':' + config.mysql.port + '/' + config.mysql.db;


pool = generic_pool.Pool({
     name: 'mysql'
    ,create: function(callback) {
        createMysqlConnection(callback);
    }
	,validate: function(client)  {
		console.log('Connected: ' + client.connected);
		return client.connected;
	}
    ,destroy: function(client) {
		client.end();
	}
    ,max: 50
    ,min: 1
    ,idleTimeoutMillis: 1 * 60 * 1000
	,reapIntervalMillis: 5 * 1000
    ,log: false 
});

/*
setInterval(function(){
	pool.dispense();
}, 1000);
*/

module.exports = pool;

function createMysqlConnection(connect_callback)
{
	var conn = mysql.createConnection(mysql_uri);
	
	conn.connected = true;
	
	//This causes it to try to reconnect automaticly.
	conn.on('error', function(err) {
		if (!err.fatal) {
			return;
		}

		if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err;
		}
		
		console.log('Dead.');
		
		//set connected to false so it gets reaped from the pool
		conn.connected = false;
	});
	
	conn.real_query = conn.query;
	
	//Wrap the query function to add the sql to the error
	conn.query = function(sql, values, callback) {
		//could also use this to time queries?
		
		conn.real_query(sql, values, function(err, rows, fields) {
			if (err) {
				err.query = sql;
			}
			
			callback(err, rows, fields);
		});
	};
	
	//Return a single row from a query
	conn.query_row = function(sql, values, callback) {
		conn.query(sql, values, function(err, rows, fields) {
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
	conn.query_var = function(sql, values, callback) {
		conn.query(sql, values, function(err, rows, fields) {
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
	conn.query_found_rows = function(callback) {
		conn.query_var('SELECT FOUND_ROWS()', {}, function(err, count) {
			callback(err, count);
		});
	};
	
	//quick ROW_COUNT() function
	conn.query_row_count = function(callback) {
		conn.query_var('SELECT ROW_COUNT()', {}, function(err, count) {
			callback(err, count);
		});
	};
	
	//customize how values are interpolated in the sql
	conn.format = function (query, values) {
		if (!values) return query;
		return query.replace(/\:(\w+)/g, function (txt, key) {
			if (values.hasOwnProperty(key)) {
				return this.escape(values[key]);
			}
			return txt;
		}.bind(this));
	};
	
	//hey, hey, lets go
	conn.connect(function(err) {
		if (err) {
			console.error('Error connecting to MySQL');
			console.error(err);
		} else {
			//console.log('Connected to MySQL');
		}
		
		connect_callback(err, conn);
	});
	
	return conn;
}

//module.exports.createMysqlConnection = createMysqlConnection;