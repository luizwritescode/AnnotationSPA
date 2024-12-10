
// Function to switch between screens
function switchScreen(screen) {
	// Hide all screens except the one that is passed as an argument
	screens.forEach(function (s) {
		if (s === screen) {
			document.getElementById(s).style.display = 'flex';
		} else {
			document.getElementById(s).style.display = 'none';
		}
	});

	// Update the current screen
	currentScreen = screen;
}



function preloadImages(images) {
	images.forEach(function (imageUrl) {
		const img = new Image();
		img.src = imageUrl

		let imgName = imageUrl.split("/").pop();

		img.onload = function () {
			loadedImages[imgName] = img;
		}
	});
}


// Function to shuffle an array
function shuffle(array) {
	var currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {

		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}



function createOverlay(hasLoader = false) {
	// Create a new div element
	const overlay = document.createElement('div');

	overlay.id = 'overlay';
	
	// Set the CSS styles for the overlay
	overlay.style.position = 'fixed';
	overlay.style.top = '0';
	overlay.style.left = '0';
	overlay.style.width = '100%';
	overlay.style.height = '100%';
	overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	overlay.style.zIndex = '9999';
	
	// Append the overlay to the body of the document
	document.body.appendChild(overlay);

	if(hasLoader) {
		// Create a new div element for the loader
		const loader = document.createElement('div');

		loader.id = 'loading-text';
		
		loader.innerHTML = '<h3>Carregando...</h3>';

		// Set the CSS styles for the loader
		loader.style.position = 'absolute';
		loader.style.top = '50%';
		loader.style.left = '50%';
		loader.style.transform = 'translate(-50%, -50%)';
		loader.style.color = 'white';
		loader.style.fontSize = '24px';
		loader.style.fontWeight = 'bold';

		
		// Append the loader to the overlay
		overlay.appendChild(loader);
	
	}
}

function disableOverlay() {
	// Remove the overlay from the body of the document
	document.body.removeChild(document.getElementById('overlay'));
}
function modalAlert(message) {
	createOverlay(true); // Pass true to create overlay with loader

	// Create a new div element for the modal
	const modal = document.createElement('div');
	modal.id = 'modal';

	// Set the CSS styles for the modal
	modal.style.display = 'flex';
	modal.style.flexDirection = 'column';
	modal.style.position = 'fixed';
	modal.style.top = '50%';
	modal.style.left = '50%';
	modal.style.transform = 'translate(-50%, -50%)';
	modal.style.backgroundColor = 'rgb(33, 33, 33)';
	modal.style.padding = '20px';
	modal.style.borderRadius = '5px';
	modal.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
	modal.style.zIndex = '9999';

	// Create a new paragraph element for the message
	const messageElement = document.createElement('p');
	messageElement.textContent = message;

	// Create a new button element for closing the modal
	

	const closeButton = document.createElement('button');
	closeButton.classList.add('btn', 'btn-large');
	closeButton.style.display = 'flex';
	closeButton.style.justifyContent = 'center';
	closeButton.textContent = 'OK';
	closeButton.addEventListener('click', function () {
		document.body.removeChild(modal);
		disableOverlay(); // Call disableOverlay to remove the overlay
	});
	const closeButtonDiv = document.createElement('div');
	closeButtonDiv.style.display = 'flex';
	closeButtonDiv.style.justifyContent = 'center';
	closeButtonDiv.appendChild(closeButton);
	// Append the message and close button to the modal
	modal.appendChild(messageElement);
	modal.appendChild(closeButtonDiv);

	// Append the modal to the body of the document
	document.body.appendChild(modal);
}




function saveStateToLocalStorage() {
	debugger
	if (trainingMode) {
		return;
	}

	console.log('saving state to local storage')
	localStorage.setItem('userId', userId);

	// extract the image urls from the images object
	var image_metadata = {};
	for (var key in images) {
		let imageName = images[key].src.split("/").pop();

		image_metadata[imageName] = {
			ground_truth: images[key]["ground_truth"],
			src: images[key]["src"]
		}
	}


	var state = {
		startTimestamp: startTimestamp,
		currentIndex: currentIndex,
		currentImageId: currentImageId,
		images: image_metadata,
		annotations: annotations,
		trainingMode: trainingMode
	}

	localStorage.setItem('state', JSON.stringify(state));

}

function loadStateFromLocalStorage() {
	var state = JSON.parse(localStorage.getItem('state'));

	if (state !== null) {

		// reconstruct the images object from img urls
		let stringified_image_entries = Object.entries(state.images);
		let reconstructed_images = {};
		for (var i = 0; i < stringified_image_entries.length; i++) {
			var img = new Image();
			img.src = stringified_image_entries[i][1]["src"];
			img.ground_truth = stringified_image_entries[i][1]["ground_truth"];
			reconstructed_images[stringified_image_entries[i][0]] = img;
		}

		startTimestamp = state.startTimestamp;
		currentIndex = state.currentIndex;
		currentImageId = state.currentImageId;
		images = Object.values(reconstructed_images);
		annotations = state.annotations;
		trainingMode = state.trainingMode;
	}
	console.log(state)
	return state;
}

function clearStateFromLocalStorage() {
	localStorage.removeItem('state');
}

