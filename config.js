console.log('NODE_ENV = ' + process.env.NODE_ENV);

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
};

if (process.env.NODE_ENV == 'production')
{
		conf.site_name = 'crosma.us';

		conf.static_url = 'http ://cf.crosma.us';
		conf.cache_static = true;
		
		conf.cache_views = true;
		
		conf.domains.main = 'crosma.us';
		conf.domains.static = 'static.crosma.us';
}

module.exports = conf;