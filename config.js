var conf = {
	 port: 80
	 
	,root: __dirname
	
	,site_name: 'dev.crosma.us'
	
	,static_dir: '/static'
	,static_url: 'http://static.dev.crosma.us'
	,cache_static: false
			
	,controllers_dir: '/controllers'
	
	,cache_views: false
	
	,admin_dir: '/admin'

	,domains: {
		 main: 'dev.crosma.us'
		,admin: 'admin.dev.crosma.us'
		,static: 'static.dev.crosma.us'
	}
	
	,local_css_files: ['/css/lib/bootstrap.css', '/css/admin.css', '/css/lib/bootstrap-responsive.css']
	,local_js_files: ['/js/lib/jquery-1.7.2.js', '/js/lib/bootstrap.js']
	
	,mongodb_uri: 'mongodb://crosma.us/crosma'
	
	,amazon: {
		 key: process.env.AMAZON_KEY
		,secret: process.env.AMAZON_SECRET
	}
	
	,mongodb: {
		 address: process.env.MONGODB_ADDRESS
		,port: process.env.MONGODB_PORT
		,user: process.env.MONGODB_USER
		,pass: process.env.MONGODB_PASSWORD
		,db: process.env.MONGODB_DB
	}
	
	,redis: {
		 address: process.env.REDIS_ADDRESS
		,port: process.env.REDIS_PORT
		,pass: process.env.REDIS_PASSWORD
	}
	
	,mysql: {
		 address: process.env.MYSQL_ADDRESS
		,port: process.env.MYSQL_PORT
		,user: process.env.MYSQL_USER
		,pass: process.env.MYSQL_PASSWORD
		,db: process.env.MYSQL_DB
	}
	
	,twitter: {
		 consumer_key: process.env.TWITTER_CONSUMER_KEY
		,consumer_secret: process.env.TWITTER_CONSUMER_SECRET
		,access_token: process.env.TWITTER_ACCESS_TOKEN
		,access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
	}
};

if (process.env.NODE_ENV == 'production')
{
	conf.port = 8000;

	conf.site_name = 'crosma.us';

	conf.static_url = 'http://static.crosma.us';
	conf.cache_static = true;
	
	conf.cache_views = true;
	
	conf.domains.main = 'crosma.us';
	conf.domains.admin = 'admin.crosma.us';
	conf.domains.static = 'static.crosma.us';
	
	conf.local_css_files = ['/css/lib/bootstrap.min.css', '/css/admin.min.css', '/css/lib/bootstrap-responsive.min.css'];
	conf.local_js_files = ['/js/lib/jquery-1.7.2.min.js', '/js/lib/bootstrap.min.js'];
	
	conf.mongodb_uri = 'mongodb://localhost/crosma';
}

	

module.exports = conf;