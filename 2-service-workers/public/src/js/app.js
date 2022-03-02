// declaring varable to hold reference of banner event for future usage
var deferredPrompt

if ('serviceWorker' in navigator){
	navigator
	.serviceWorker
	.register('/sw.js')
	// incase need to apply scoping for service worker, for example
	// .register('/sw.js', {scope: '/help'})

	.then(() => {
		console.log('service worker registered')		
	})
}

window.addEventListener('beforeinstallprompt', (event) => {
	// preventing banner (promoting to install, add app icon onto home screen) to popup on the screen
	event.preventDefault()

	// holding banner reference for future usage
	deferredPrompt = event

	return false
})
