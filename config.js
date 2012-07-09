var conf = {
	 port: 80
	 
	,root: __dirname
	
	,site_name: 'violentsoul.com'
	
	,static_dir: '/static'
	,static_url: 'http://s.violentsoul.com'
	,cache_static: false
			
	,controllers_dir: '/controllers'
	
	,views_dir: '/views'
	,views_errors: '/views_errors'
	,cache_views: false
	
	,admin_dir: '/admin'
	,admin_views_dir: '/admin/views'
	
	,domains: {
		 main: 'violentsoul.com'
		,admin: 'admin.violentsoul.com'
		,static: 's.violentsoul.com'
	}
	
	,local_css_files: ['bootstrap.css', 'admin.css', 'bootstrap-responsive.css']
	,local_js_files: ['jquery-1.7.2.js', 'bootstrap.js']
	
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
	
};

if (process.env.CROSMA_ENV == 'production')
{
	conf.port = 8000;

	conf.site_name = 'crosma.us';

	conf.static_url = 'http://static.crosma.us';
	conf.cache_static = true;
	
	conf.cache_views = true;
	
	conf.domains.main = 'crosma.us';
	conf.domains.admin = 'admin.crosma.us';
	conf.domains.static = 'static.crosma.us';
	
	conf.local_css_files = ['bootstrap.min.css', 'admin.min.css', 'bootstrap-responsive.min.css'];
	conf.local_js_files = ['jquery-1.7.2.min.js', 'bootstrap.min.js'];
	
	conf.mongodb_uri = 'mongodb://localhost/crosma';
}

	

module.exports = conf;