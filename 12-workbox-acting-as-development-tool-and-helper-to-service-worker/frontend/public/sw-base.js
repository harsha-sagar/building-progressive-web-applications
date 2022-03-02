importScripts('workbox-sw.prod.v2.1.3.js');

importScripts('/src/js/idb.js')
importScripts('/src/js/utility.js')

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
	/.*(?:googleapis|gstatic)\.com.*$/,
	workboxSW.strategies.staleWhileRevalidate({
		cacheName: 'google-fonts'
	})
)
// staleWhileRevalidate strategy is the cache then network approach, with dynamic caching

workboxSW.router.registerRoute(
	"https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
	workboxSW.strategies.staleWhileRevalidate({
		cacheName: 'material-css'
	})
)

workboxSW.router.registerRoute(
	/.*(?:firebasestorage\.googleapis)\.com.*$/,
	workboxSW.strategies.staleWhileRevalidate({
		cacheName: 'post-images'
	})
)

workboxSW.router.registerRoute(
	"https://pwagram-39d1e-default-rtdb.firebaseio.com/posts.json",
	(args) => {
		return fetch(args.event.request)
			.then((res) => {
				var resClone = res.clone()

				clearAllData('posts')
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
	}
)

workboxSW.router.registerRoute(
	function(routeData){
		// return true
		// - default incase need to serve all the fetch requests

		return (routeData.event.request.headers.get('accept').includes('text/html'))

	},
	(args) => {
		return caches.match(args.event.request).then((response) => {
			if(response){
				return response
			} else{
				return fetch(args.event.request)
					.then((res) => {
						return caches.open('dynamic').then((cache) => {
							cache.put(args.event.request.url, res.clone())
							return res
						})
					})
					.catch((err) => {
						console.log('error', err)
						return caches
							.match('/offline.html')
							.then((res) => {
								return res
							})
					})
			}
		})		

	}
)

workboxSW.precache([]);

self.addEventListener('sync', (event) => {
	console.log('[service worker] background syncing', event)
	if (event.tag === 'sync-new-post'){
		console.log('[service worker] syncing new posts')
		event.waitUntil(
			readAllData('sync-posts')
				.then((data) => {
					for(var dt of data){

						// Using the blob reference picture, we can upload the onto the cloud & we hold accessible URL
						// mocking blob URL
						var image = "https://firebasestorage.googleapis.com/v0/b/pwagram-39d1e.appspot.com/o/sf-boat.jpg?alt=media&token=935bca78-f25d-4169-a534-ac111d12275c"

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
								image: image
							})
						})	
						.then((res) => {
							console.log('[service worker] sent data', res)
							if(res.ok){
								clearData('sync-posts', dt.id)
							}
						})
						.then(() => {
							fetch('http://localhost:3000/notify-subscriptions')
						})							
						.catch((error) => {
							console.log('[service worker] error while sending data', error)
						})

					}
				})
		)
	}
})

self.addEventListener('notificationclick', (event) => {
	var notification = event.notification
	var action = event.action

	console.log('[service worker] notification clicked', notification)

	if(action === 'confirm'){
		notification.close()

		console.log('[service worker] confirm was choosen from notification ')

	} else{

		event.waitUntil(
			clients
				.matchAll()
				.then((clnts) => {
					var client = clnts.find((c) => {
						return c.visibilityState === 'visible'
					})

					if (client !== 'undefined'){
						client.navigate('http://localhost:8080' + notification.data.url)
						client.focus()
					} else {
						clients.openWindow('http://localhost:8080' + notification.data.url)
					}

					notification.close()
				})
		)


		console.log('[service worker] action choosen from notification')
	}
})

self.addEventListener('notificationclose', (event) => {
	console.log('[service worker] notification was just closed', event)
})

self.addEventListener('push', (event) => {
	console.log('[service worker] push notification received', event)

	if(event.data){
		data = JSON.parse(event.data.text())
	}

	var options = {
		body: data.content,
		icon: '/src/images/icons/app-icon-96x96.png',
		image: '/src/images/sf-boat.jpg',
		dir: 'ltr',
		lang: 'en-US',
		vibrate: [100, 50, 200],
		badge: '/src/images/icons/app-icon-96x96.png',
		tag: 'confirm-notification',
		renotify: true,
		actions: [
			{ action: 'confirm', title: 'okay', icon: '/src/images/icons/app-icon-96x96.png'},
			{ action: 'cancel', title: 'cancel', icon: '/src/images/icons/app-icon-96x96.png'}
		],
		data: {
			url: data.openUrl
		}
	}

	event.waitUntil(
		self.registration.showNotification(data.title, options)
	)

})
