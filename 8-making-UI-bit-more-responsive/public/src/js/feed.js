var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.transform = 'translateY(0)';
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
  createPostArea.style.transform = 'translateY(100vh)';
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
