var deferredPrompt

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator){
	navigator
	.serviceWorker
	.register('/sw.js')
	.then(() => {
		console.log('service worker registered')		
	})
}

window.addEventListener('beforeinstallprompt', (event) => {
	event.preventDefault()

	deferredPrompt = event

	return false
})
