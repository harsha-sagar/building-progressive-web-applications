var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
	if (deferredPrompt){
		// prompting the banner to add app icon to home screen
		deferredPrompt.prompt()

		// callback once after clicks the options from banner
		deferredPrompt.userChoice.then((choiceRes) => {
			if (choiceRes.outcome === 'dismissed'){
				console.log('user cancelled installation')
			} else {
				console.log('user added icon to home screen')
			}
		})
		
		deferredPrompt = null
	}
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
