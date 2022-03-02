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

workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "487777aeb15834f6883553c70a4a0f21"
  },
  {
    "url": "manifest.json",
    "revision": "43a2c2236fea892812c8d8b3f52f5dea"
  },
  {
    "url": "offline.html",
    "revision": "1d30f033fe070f24ddb25e5ccc922788"
  },
  {
    "url": "serviceWorker.js",
    "revision": "f15ed9fc04ce948aecf723d9cb75cd89"
  },
  {
    "url": "src/css/app.css",
    "revision": "7f688bd45088745b56b657d430286176"
  },
  {
    "url": "src/css/feed.css",
    "revision": "3effbc9db83b028e4d020bb3f713b16b"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "76ba43d1b2d5e8c97b7807b26f3d5aa3"
  },
  {
    "url": "src/js/app.min.js",
    "revision": "5a59aaa551461bcdf20b426c85571702"
  },
  {
    "url": "src/js/feed.js",
    "revision": "a03fed1b1852cdfb3e99ecd17b00ab8c"
  },
  {
    "url": "src/js/feed.min.js",
    "revision": "9f68baca7dfc402b3f2b4f3e6d48d65e"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/fetch.min.js",
    "revision": "80ccc680cbfed27824c9034064581f60"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/idb.min.js",
    "revision": "512f54050858024858bcadd55fd67f32"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/promise.min.js",
    "revision": "df88ae76718e421901c2293b59e979b7"
  },
  {
    "url": "src/js/utility.js",
    "revision": "749e6808e906378217d8a353c831924f"
  },
  {
    "url": "src/js/utility.min.js",
    "revision": "bf27ade4b04754c4c3f80b34cc05cef4"
  },
  {
    "url": "sw-base.js",
    "revision": "8e9ada6dbeb235c4289e5689e2ac3c5d"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
]);

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
