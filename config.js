if (process.env.CROSMA_ENV == 'dev')
{
	console.log('Loaded dev config.');

	module.exports = {
		 port: 80
		 
		,root: __dirname //'P:/Program Files (x86)/nodejs/vs'
		
		,static_dir: '/static'
		
		,controllers_dir: '/controllers'
		,views_dir: '/views'
		
		,views_errors: '/views_errors'
		
		,domains: {
			 main: 'violentsoul.com'
			,static: 's.violentsoul.com'
		}
	};
}
else
{
	console.log('Loaded main config.');

	module.exports = {
		 port: 80
		 
		,root: __dirname //'P:/Program Files (x86)/nodejs/vs'
		
		,static_dir: '/static'
		
		,controllers_dir: '/controllers'
		,views_dir: '/views'
		
		,views_errors: '/views_errors'
		
		,domains: {
			 main: 'crosma.us'
			,static: 'static.crosma.us'
		}
	};
}