self.addEventListener('install', (event) => {
	console.log('[Service Worker] installing service worker: ', event)
})

self.addEventListener('activate', (event) => {
	console.log('[Service Worker] activating service worker: ', event)
	return self.clients.claim()
})

self.addEventListener('fetch', (event) => {
	console.log('[Service Worker] fetching from service worker: ', event)

	// by default
	// event.respondWith(fetch(event.request))

	// overriding the fetch response for example
	// event.respondWith(null)
})
	