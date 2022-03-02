const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

const webPush = require("web-push")

const formidable = require('formidable')

const fs = require('fs')

const firebase = require("firebase/app")
const { initializeApp } = firebase

const firebaseStorage = require("firebase/storage")
const { getStorage, ref, uploadBytes } = firebaseStorage

server.use(middlewares)

server.get('/notify-subscriptions', (req, res) => {
	
	// prerequisites
	// - make sure to generate vapid keys
	//   - command: npm run web-push generate-vapid-keys 
	//   - copy the public key reference to your client, where subscription is created
	//   - pass the public key & private key references below for webPush configuration as below

	webPush.setVapidDetails('mailto:mailtoharshasagar@gmail.com', 'BHravC5_dCsKTciME0ibsmG8m6VmMdTQK6ZglMyNB8EPFTagKpFD911XpYnAdeOgit7FLb7NsviqWbvU263Yf5w', 'PeuyAHIyxhYX37FOsMVYo_BRRCoHkSjUTZcMqRoSPlU')
	// webPush.setVapidDetails(<identifier>, <vapid public key>, <vapid private key>)

	var fs = require('fs')
	var subscriptions = JSON.parse(fs.readFileSync('db.json', 'utf8')).subscriptions

	subscriptions.forEach(function(subscription){
		var pushConfig = {
			endpoint: subscription.endpoint,
			keys: {
				auth: subscription.keys.auth,
				p256dh: subscription.keys.p256dh
			}
		}
		webPush
			.sendNotification(pushConfig, JSON.stringify({
				title: 'New post',
				content: 'New post added',
				openUrl: '/help'
			}))
			.catch((error)  => {
				console.log('error in sending push web notification')
			})
	})

	res.jsonp(req.query)
})

server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})
