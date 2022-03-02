var deferredPrompt

var enableNotifications = document.querySelectorAll('.enable-notifications')

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator){
	navigator
	.serviceWorker
	.register('/serviceWorker.js')
	.then(() => {
		console.log('service worker registered')		
	})
}

window.addEventListener('beforeinstallprompt', (event) => {
	event.preventDefault()

	deferredPrompt = event

	return false
})

function displayConfirmNotification(){
	// showing notifications from our javascript
	// var options = {
	// 	body: 'Successfully subscribed to our notification service'
	// }
	// new Notification('succesfully subscribed!!!')

	// showing notifications from service worker

	if('serviceWorker' in navigator){
		navigator.serviceWorker.ready
			.then(function(sw){
				var options = {
					body: 'Successfully subscribed to our notification service',
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
					]
				}
				sw.showNotification('succesfully subscribed!!!', options)
			})
	}

}

var sW
function configurationPushSub() {
	if('serviceWorker' in navigator){
		navigator.serviceWorker.ready
			.then(function(sw){
				sW = sw
				return sw.pushManager.getSubscription()
			})
			.then(function(sub){
				if (sub === null){
					// create new subscription

					// prerequisites
					// - make sure to generate vapid keys on your server first
					//   - command: npm run web-push generate-vapid-keys 
					//   - paste the public key below

					var vapidPublicKey = "BHravC5_dCsKTciME0ibsmG8m6VmMdTQK6ZglMyNB8EPFTagKpFD911XpYnAdeOgit7FLb7NsviqWbvU263Yf5w"
					var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey)
					return sW.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: convertedVapidPublicKey
					})
				} else {
					// using existing subscription
				}
			})
			.then(function(sub){
				return fetch("http://localhost:3000/subscriptions", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					},
					body: JSON.stringify(sub)
				})

			})
			.then(function(res){
				console.log('subscription saved response', res)
				console.log('subscription saved ok', res?.ok)
				displayConfirmNotification()
			})
			.catch(function(err){
				console.log(err)
			})
	}
}

function askNotificationPermission(event){
	Notification.requestPermission(function(result){
		console.log('User choice', result)

		if (result === 'granted'){
			configurationPushSub()
			// displayConfirmNotification()

			// hiding button since permissions granted
			// for(var i = 0; i < enableNotifications.length; i++){
			// 	enableNotifications[i].style.display = 'none'
			// }

		} else if (result === 'denied'){
			console.log('no notification permission granted')			
		}
	})
}

if ('Notification' in window){
	for(var i = 0; i < enableNotifications.length; i++){
		// hiding button incase user denied the notification permission
		// if (Notification.permission !== 'granted'){
			enableNotifications[i].style.display = 'inline-block'
		// }
		enableNotifications[i].addEventListener('click', askNotificationPermission)
	}
}
