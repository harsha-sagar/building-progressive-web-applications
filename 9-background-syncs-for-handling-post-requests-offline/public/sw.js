importScripts('/src/js/idb.js')
importScripts('/src/js/utility.js')

var CACHE_STATIC_NAME = 'static-v4'
var CACHE_DYNAMIC_NAME = 'dynamic-v4'
var STATIC_FILES = [
	'/',
	'/index.html',
	'/offline.html',
	'/src/js/app.js',
	'/src/js/feed.js',
	'/src/js/promise.js',
	'/src/js/fetch.js',
	'/src/js/idb.js',
	'/src/js/utility.js',
	'/src/js/material.min.js',
	'/src/css/app.css',
	'/src/css/feed.css',
	'/src/images/main-image.jpg',
	'https://fonts.googleapis.com/css?family=Roboto:400,700',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
]

self.addEventListener('install', (event) => {
	console.log('[Service worker] precaching app shell')
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME).then((cache) => {
			cache.addAll(STATIC_FILES)
		})
	)	
})

self.addEventListener('activate', (event) => {
	console.log('[Service worker] service worker activated')
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

	var url = 'https://pwagram-39d1e-default-rtdb.firebaseio.com/posts.json'
	if (event.request.url.indexOf(url) > -1){

		// for specific requests (helpful for data/json requests)
		//  stratergy: cache & network in parallel, with dynamic caching the response from network 
		event.respondWith(fetch(event.request)
			.then((res) => {
				var resClone = res.clone()

				// clear all the objects from object store at one shot 
				clearAllData('posts')

				// clear the objects from object store one at a time 
				// var clearDataPromises = []
				// for(key in data) {
				// 	clearDataPromises.push(clearData('posts', data[key].id))
				// }
				// Promise.all(clearDataPromises)

				.then(() => {
					return resClone.json()	
				})
				.then((data) => {
					for(key in data){
						writeData('posts', data[key])
					}
				})
				return res
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
					return fetch(event.request)
						.then((res) => {
							return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
								cache.put(event.request.url, res.clone())
								return res
							})
						})
						.catch((err) => {
							console.log('error', err)
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

self.addEventListener('sync', (event) => {
	console.log('[service worker] background syncing', event)
	if (event.tag === 'sync-new-post'){
		console.log('[service worker] syncing new posts')
		event.waitUntil(
			readAllData('sync-posts')
				.then((data) => {
					for(var dt of data){

						fetch('https://pwagram-39d1e-default-rtdb.firebaseio.com/posts.json', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								'Accept': 'application/json'
							},
							body: JSON.stringify({
								id: dt.id,
								title: dt.title,
								location: dt.location,
								image: "https://firebasestorage.googleapis.com/v0/b/pwagram-39d1e.appspot.com/o/sf-boat.jpg?alt=media&token=935bca78-f25d-4169-a534-ac111d12275c"
							})
						})
						.then((res) => {
							console.log('[service worker] sent data', res)
							if(res.ok){
								clearData('sync-posts', dt.id)
							}
						})
						.catch((error) => {
							console.log('[service worker] error while sending data', error)
						})
	
					}


				})
		)
	}
})