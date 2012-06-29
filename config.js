if (process.env.CROSMA_ENV == 'dev')
{
	console.log('Loaded development config.');

	module.exports = {
		 port: 80
		 
		,root: __dirname //'P:/Program Files (x86)/nodejs/vs'
		
		,static_dir: '/static'
		
		,controllers_dir: '/controllers'
		
		,views_dir: '/views'
		,cache_views: false
		
		,views_errors: '/views_errors'
		
		,domains: {
			 main: 'violentsoul.com'
			,static: 's.violentsoul.com'
		}
		
		,static_url: '/static'
	};
}
else
{
	console.log('Loaded production config.');

	module.exports = {
		 port: 80
		 
		,root: __dirname //'P:/Program Files (x86)/nodejs/vs'
		
		,static_dir: '/static'
		
		,controllers_dir: '/controllers'
		
		,views_dir: '/views'
		,cache_views: true
		
		,views_errors: '/views_errors'
		
		,domains: {
			 main: 'crosma.us'
			,static: 'static.crosma.us'
		}
		
		,static_url: 'http://static.crosma.us'
	};
}