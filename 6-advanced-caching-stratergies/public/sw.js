var CACHE_STATIC_NAME = 'static-v8'
var CACHE_DYNAMIC_NAME = 'dynamic-v8'
var STATIC_FILES = [
	'/',
	'/index.html',
	'/offline.html',
	'/src/js/app.js',
	'/src/js/feed.js',
	'/src/js/promise.js',
	'/src/js/fetch.js',
	'/src/js/material.min.js',
	'/src/css/app.css',
	'/src/css/feed.css',
	'/src/images/main-image.jpg',
	'https://fonts.googleapis.com/css?family=Roboto:400,700',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME).then((cache) => {
			console.log('[Service worker] precaching app shell')
			cache.addAll(STATIC_FILES)
		})
	)	
})

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
						return caches.delete(key)
					}
				})
			)

		})
	)
	return self.clients.claim()
})

// stratergy: cache first & then network as fallback, with dynamic caching the response from network 
// self.addEventListener('fetch', (event) => {
// 	event.respondWith(
// 		caches.match(event.request).then((response) => {
// 			if(response){
// 				return response
// 			} else{
// 				fetch(event.request)
// 				.then((res) => {
// 					return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
// 						cache.put(event.request.url, res.clone())
// 						return res
// 					})
// 				})
// 				.catch((err) => {
// 				})
// 			}	
// 		})
// 	)
// })

// stratergy: network first & then cache as fallback, with dynamic caching the response from network 
// self.addEventListener('fetch', (event) => {
// 	event.respondWith(
// 		fetch(event.request)
// 		.then((res) => {
// 			return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
// 				cache.put(event.request.url, res.clone())
// 				return res
// 			})
// 		})
// 		.catch((err) => {
// 			return caches.match(event.request)
// 		})
// 	)
// })

// stratergy: cache with network as fallback 
// self.addEventListener('fetch', (event) => {
// 	event.respondWith(
// 		caches.match(event.request).then((response) => {
// 			if(response){
// 				return response
// 			} else{
// 				fetch(event.request)
// 			}	
// 		})
// 	)
// })

// stratergy: network with cache as fallback 
// self.addEventListener('fetch', (event) => {
// 	event.respondWith(
// 		fetch(event.request)
// 			.catch((err) => {
// 				return caches.match(event.request)
// 			})
// 	)
// })

// stratergy: cache only 
// self.addEventListener('fetch', (event) => {
// 	event.respondWith(
// 		caches.match(event.request)
// 	)
// })

// stratergy: network only 
// self.addEventListener('fetch', (event) => {
// 	event.respondWith(
// 		fetch(event.request)
// 	)
// })

//  stratergy: cache & network in parallel, with dynamic caching the response from network 
// self.addEventListener('fetch', (event) => {
//  	event.respondWith(
// 		caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
// 			return fetch(event.request)
// 				.then((res) => {
//  					cache.put(event.request.url, res.clone())
//  					return res
//  			})
//  		})
//  	)
// })

self.addEventListener('fetch', (event) => {
	var url = 'https://httpbin.org/get'
	if (event.request.url.indexOf(url) > -1){

		// for specific requests (helpful for data/json requests)
		//  stratergy: cache & network in parallel, with dynamic caching the response from network 
		event.respondWith(
			caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
				return fetch(event.request)
					.then((res) => {
						 cache.put(event.request.url, res.clone())
						 return res
				 })
			 })
		 )
	// } else if (new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url)) {
	} else if (STATIC_FILES.includes(event.request.url)) {

			// for assets (html, css, js & other assets)
			// stratergy: cache only 
			event.respondWith(
				caches.match(event.request)
			)
	} else{

		// for other requests
		// stratergy: cache first & then network as fallback, with dynamic caching the response from network 
		event.respondWith(
			caches.match(event.request).then((response) => {
				if(response){
					return response
				} else{
					fetch(event.request)
						.then((res) => {
							return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
								cache.put(event.request.url, res.clone())
								return res
							})
						})
						.catch((err) => {
							return caches.open(CACHE_STATIC_NAME).then((cache) => {
								// fallback page incase network failure for selective resources like help page 
								// if(event.request.url == '/help'){
								if(event.request.headers.get('accept').includes('text/html')) {
									return cache.match('/offline.html')
								}
							})
						})
				}
			})
		)
	}
})