console.log('CROSMA_ENV = ' + process.env.CROSMA_ENV);

var conf = {
	 port: 80
	 
	,root: __dirname
	
	,site_name: 'violentsoul.com'
	
	,static_dir: '/static'
	,static_url: 'http://s.violentsoul.com'
	,cache_static: true
			
	,controllers_dir: '/controllers'
	
	,views_dir: '/views'
	,views_errors: '/views_errors'
	,cache_views: false
	
	,domains: {
		 main: 'violentsoul.com'
		,static: 's.violentsoul.com'
	}
	
	,bootstrap_css: 'bootstrap.css'
	,local_css_files: ['bootstrap-responsive.css']
	,local_js_files: ['jquery-1.7.2.js', 'bootstrap.js']
};

if (process.env.CROSMA_ENV == 'production')
{
	conf.port = 8000;

	conf.site_name = 'crosma.us';

	conf.static_url = 'http://static.crosma.us';
	conf.cache_static = true;
	
	conf.cache_views = true;
	
	conf.domains.main = 'crosma.us';
	conf.domains.static = 'static.crosma.us';
}

module.exports = conf;