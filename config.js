if (process.env.CROSMA_ENV == 'dev')
{
	console.log('Loaded development config.');

	module.exports = {
		 port: 80
		 
		,root: __dirname
		
		,site_name: 'violentsoul.com'
		
		,static_dir: '/static'
		,static_url: 'http://s.violentsoul.com'
				
		,controllers_dir: '/controllers'
		
		,views_dir: '/views'
		,views_errors: '/views_errors'
		,cache_views: false
		
		,domains: {
			 main: 'violentsoul.com'
			,static: 's.violentsoul.com'
		}
	};
}
else
{
	console.log('Loaded production config.');

	module.exports = {
		 port: 80
		 
		,root: __dirname
		
		,site_name: 'crosma.us'
		
		,static_dir: '/static'
		,static_url: 'http://cf.crosma.us'
		
		,controllers_dir: '/controllers'
		
		,views_dir: '/views'
		,views_errors: '/views_errors'
		,cache_views: true
		
		,domains: {
			 main: 'crosma.us'
			,static: 'static.crosma.us'
		}
	};
}