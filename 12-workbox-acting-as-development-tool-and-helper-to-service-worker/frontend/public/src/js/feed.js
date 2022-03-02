var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form')
var titleInput = document.querySelector('#title')
var locationInput = document.querySelector('#location')

var videoPlayer = document.querySelector('#player');
var captureButton = document.querySelector('#capture-btn');
var canvasElement = document.querySelector('#canvas');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');
var picture;

var locationBtn = document.querySelector('#location-btn');
var locationLoader = document.querySelector('#location-loader');
var fetchedLocation;

function initializeMedia() {
	// modern browsers allows accessing to media (like camera, microphone) using mediaDevices object

	// incase browser doesn't support media support, adding polyfills serves the purpose
	if (!('mediaDevices' in navigator)){
		navigator.mediaDevices = {}
	}

	if(!('getUserMedia' in navigator.mediaDevices)){
		navigator.mediaDevices.getUserMedia = function(constraints){

			// for Safari & Mozilla, since getUserMedia function is accesible through other references
			// - for safari: webkitGetUserMedia
			// - for Mozilla: mozGetUserMedia
			// for rest of the browser, no media support

			var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia

			if (!(getUserMedia)){

				// applicable to rest of browsers doesn't supporting media
				return Promise.reject(new Error('getUserMedia is not implemented!')) 
			} else{

				// incase the browser is Safari & Mozilla, the found reference for getUserMedia acts as wrapper
				return new Promise(function(resolve, reject){
					getUserMedia.call(navigator, constraints, resolve, reject)
				})
			}
		}
	}

	// from this point it can be ensured media capability is enabled
	
	// constructing constraints configuration
	var constraints = {
		video: true
	}
	// incase audio is also expected
	// var constraints = {
	// 	video: true,
	// 	audio: true
	// } 

	navigator
		.mediaDevices
		.getUserMedia(constraints)
		.then(function(stream){
			videoPlayer.srcObject = stream
			videoPlayer.style.display = 'block'
		})
		.catch(function(error){
			// ended up here since no support for media accessbility
			// - could be browser not supporting media access
			// could be user denied the permission to access media
			// could be device not supported with camera/media
			console.log(error)

			// fallback functionality for image picker (basically enabling uploading file functionality)
			imagePickerArea.style.display = 'block'
		})
}

function initializeLocation(){
	if(!('geolocation' in navigator)){
		locationBtn.style.display = 'none'
	}
}

// listening for taking selfie
captureButton.addEventListener('click', function(event){
	captureButton.style.display = 'none'
	videoPlayer.style.display = 'none'

	canvasElement.style.display = 'block'
	var context = canvasElement.getContext('2d')
	// drawing static snapshot from video streamed
	context.drawImage(videoPlayer, 0, 0, canvasElement.width, videoPlayer.videoHeight / (videoPlayer.videoWidth/canvasElement.width))

	videoPlayer.srcObject.getVideoTracks().forEach(function(track){
		track.stop()
	})

	picture = dataURItoBlob(canvasElement.toDataURL())
})

// selfie fallback i.e listening to image picker
imagePicker.addEventListener('change', function(event){
	picture = event.target.files[0]
})

// listening for fetching location
locationBtn.addEventListener('click', function(){
	if(!('geolocation' in navigator)){
		return
	}

	locationBtn.style.display = 'none'
	locationLoader.style.display = 'block'

	navigator.geolocation.getCurrentPosition(
		function(position){
			locationBtn.style.display = 'inline'
			locationLoader.style.display = 'none'

			fetchedLocation = position
		},
		function(error){
			locationBtn.style.display = 'inline'
			locationLoader.style.display = 'none'
			fetchedLocation = null

			alert('location detection doesn\'t work')
		},
		{
			timeout: 5000
		}
	)

	// using the reference from fetchedLocation we can come to know latitude & longitude for the given location detected, we can invoke google maps API & get to know the location name
	// mocking location name
	locationInput.value = 'Bangalore'	
})

function openCreatePostModal() {
	setTimeout(function(){
		createPostArea.style.transform = 'translateY(0)';
	}, 1)

	initializeMedia();
	initializeLocation()
	
	if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
	setTimeout(function(){
		createPostArea.style.transform = 'translateY(100vh)';
	}, 1)

	// hiding the media functionalties
	imagePickerArea.style.display = 'none'
	videoPlayer.style.display = 'none'
	canvasElement.style.display = 'none'
	captureButton.style.display = 'inline'

	locationBtn.style.display = 'inline';
  locationLoader.style.display = 'none';

	if (videoPlayer.srcObject){
		videoPlayer.srcObject.getVideoTracks().forEach(function(track){
			track.stop()
		})	
	}

}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// caching on demand
// function onSaveButtonClicked(event) {

// 	if('caches' in window){
// 		caches
// 			.open('user-requested')
// 			.then((cache) => {
// 				cache.add('/src/images/sf-boat.jpg')
// 				cache.add('https://httpbin.org/get')
// 			})
// 	}
// }

function clearCards() {
	while(sharedMomentsArea.hasChildNodes()){
		sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
	}
}

function createCard(card) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + card.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = card.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = card.location;
  cardSupportingText.style.textAlign = 'center';

	// var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
	// cardSupportingText.appendChild(cardSaveButton);

	cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data){
	for(var i=0; i < data.length; i++){
		createCard(data[i])
	}
}

//  stratergy: cache & network in parallel, with dynamic caching the response from network 
var url = 'https://pwagram-39d1e-default-rtdb.firebaseio.com/posts.json'
var networkDataReceived = false

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
		networkDataReceived = true
		clearCards()

		var dataArr = []
		for(key in data){
			dataArr.push(data[key])
		}
    updateUI(dataArr)
  });

if('indexedDB' in window){
	readAllData('posts')
		.then(function(data){
			if(!networkDataReceived){
				clearCards()
				updateUI(data)
			}
		})
}

function sendData(){
	var someId = new Date().toISOString()

	// Using the blob reference picture, we can upload the onto the cloud & we hold accessible URL
	// mocking blob URL
	var image = "https://firebasestorage.googleapis.com/v0/b/pwagram-39d1e.appspot.com/o/sf-boat.jpg?alt=media&token=935bca78-f25d-4169-a534-ac111d12275c"

	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify({
			id: someId,
			title: titleInput.value,
			location: locationInput.value,
			image: "image"
		})
	})
	.then(function(res){
		console.log('sent data', res)
	})
}

form.addEventListener('submit', function(event){
	event.preventDefault()

	if(titleInput.value.trim() === '' || locationInput.value.trim() === ''){
		alert('enter valid data!')
		return
	}
	
	closeCreatePostModal()

	if(('serviceWorker' in navigator) && ('SyncManager' in window)){
		navigator.serviceWorker.ready
			.then(function(sw){
				var post = {
					id: new Date().toISOString(),
					title: titleInput.value,
					location: locationInput.value,
					picture: picture
				}
				writeData('sync-posts', post)
					.then(function(){
						return sw.sync.register('sync-new-post')
					})
					.then(function(){
						var snackbarContainer = document.querySelector('#confirmation-toast')
						var data = {
							message: 'your post has been saved for syncing!!!'
						}
						snackbarContainer.MaterialSnackbar.showSnackbar(data)
					})
					.catch(function(error){
						console.log()
					})
			})
	} else {
		sendData()
	}
})
