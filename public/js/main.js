if (!db) {
	modalAlert('Aplicativo fora do ar!')
	throw new Error('could not connect to firebase!');
} else {
	console.log('connected to firebase');

	document.getElementsByClassName('connection-status')[0].innerHTML = '<p> Conectado ao Banco de Dados </p>';
}

// Define global variables
var currentScreen = 'menu-screen'; // Variable to keep track of the current screen (menu or annotate)

var currentUser = undefined

const screens = ['menu-screen', 'annotate-screen', 'form-screen', 'tutorial-screen', 'training-end-screen']; // List of all screens in the application

let appImagesUrls = [
	"img/tutorial/friends.png",
	"img/tutorial/friends5.png",
	"img/tutorial/sem_defeito/sem_defeito0.jpg",
	"img/tutorial/sem_defeito/sem_defeito1.jpg",
	"img/tutorial/sem_defeito/sem_defeito2.jpg",
	"img/tutorial/sem_defeito/sem_defeito3.jpg",
	"img/tutorial/sem_defeito/sem_defeito4.jpg",
	"img/tutorial/nao_polida/nao_polida0.jpg",
	"img/tutorial/nao_polida/nao_polida1.jpg",
	"img/tutorial/nao_polida/nao_polida2.jpg",
	"img/tutorial/nao_polida/nao_polida3.jpg",
	"img/tutorial/nao_polida/nao_polida4.jpg",
	"img/tutorial/rebarba/rebarba0.jpg",
	"img/tutorial/rebarba/rebarba1.jpg",
	"img/tutorial/rebarba/rebarba2.jpg",
	"img/tutorial/rebarba/rebarba3.jpg",
	"img/tutorial/rebarba/rebarba4.jpg",
	"img/tutorial/rachadura/rachadura0.jpg",
	"img/tutorial/rachadura/rachadura1.jpg",
	"img/tutorial/rachadura/rachadura2.jpg",
	"img/tutorial/rachadura/rachadura3.jpg",
	"img/tutorial/rachadura/rachadura4.jpg",
	"img/tutorial/perfuracao/perfuracao0.jpg",
	"img/tutorial/perfuracao/perfuracao1.jpg",
	"img/tutorial/perfuracao/perfuracao2.jpg",
	"img/tutorial/perfuracao/perfuracao3.jpg",
	"img/tutorial/perfuracao/perfuracao4.jpg",
	"img/treinamento/treinamento0.jpg",
	"img/treinamento/treinamento1.jpg",
	"img/treinamento/treinamento2.jpg",
	"img/treinamento/treinamento3.jpg",
	"img/treinamento/treinamento4.jpg",
	"img/treinamento/treinamento5.jpg",
	"img/treinamento/treinamento6.jpg",
];

var loadedImages = {} // object with all preloaded images in the application
var userId = null;
var candidateId = null;
var state = null;


// Function that starts a new trial flow
function startTrial() {

	// try to set fullscreen
	document.documentElement.requestFullscreen();
	
	//uncomment this
	switchScreen('form-screen');

	// DEBUG skip to desired screen
	
	// Switch to the tutorial screen
	//displayTutorial();

	// Switch to the annotate screen
	//initializeTest(null, 5);
	//initializeTest(null, 30);

	//initializeTraining();
}

/** 
* @param state object with the state of the application
* @param testSize number of images to be annotated has to be a multiple of 5
*/
function initializeTest(state = null, testSize = 30) {
	debugger
	//reset variables
	isPointerLocked = false;
	isDrawing = false;
	isEditing = false;
	editRectangleId = null;
	startX, startY;
	selectedClass = null

	trainingMode = false; // enables saving state to local storage
	//trainingMode = true; // JUST FOR DEBUG REMOVE THIS LINE LATER AND UNCOMMENT THE LINE ABOVE

	testLength = testSize;

	currentIndex = state ? state.currentIndex : 0;
	currentImageId = state ? state.currentImageId : "";
	images = state ? images : [];

	rectangles = [];
	rectangle;

	annotCount = 0;

	annotations = state ? state.annotations : {};

	// hides the "show answers" button
	document.getElementById('show-answer-button').style.display = "none";

	switchScreen('annotate-screen');

	createOverlay(hasLoader = true);
	
	// if we don't have a state we need to pick the images to be annotated and load them
	if(state === null) {
		
		imagesPerClass = Math.floor(testSize / 5);

		// use pickTestImages to select a balanced subset the images to be annotated
		// use useAllTestImages to select all of the images in the subset
		useAllTestImages("dataset/manifest.json", "test30", imagesPerClass, debugMode = true)
		.then(function (pickedImages) {
			loadImages(pickedImages);	
			disableOverlay();
		});
	} else {
		showImage(images[currentIndex])
		document.getElementById("image-counter").innerHTML = (currentIndex + 1) + "/" + images.length;
		disableOverlay();
	}
		
	//loadImages("dataset/manifest.json");

	// startTimestamp = state ? startTimer(state.startTimestamp) : startTimer();
	startTimestamp = state ? state.startTimestamp : new Date();
	console.log(startTimestamp);

	//disable the finish button
	if(!checkIfFinished()) {
		document.getElementById('finish-button').disabled = true;
	}

	// Create the annotation canvas
	createClassButtons();
	createAnnotationCanvas();


}

/**
 * Function to initialize the training mode
 * 
 */
function initializeTraining() {
	//reset variables
	isPointerLocked = false;
	isDrawing = false;
	isEditing = false;
	editRectangleId = null;
	startX, startY;
	selectedClass = null

	trainingMode = true; // disables saving state to local storage

	testLength = 7;

	currentIndex = 0;
	currentImageId = ""
	images = loadTrainingImages();

	rectangles = [];
	rectangle;

	annotCount = 0;

	annotations = {"treinamento0.jpg": [], "treinamento1.jpg": [], "treinamento2.jpg": [], "treinamento3.jpg": [], "treinamento4.jpg": [], "treinamento5.jpg": [], "treinamento6.jpg": []};

	switchScreen('annotate-screen');

	// Load the images
	//loadImages("dataset/train/dataset.json");

	//disable the finish button
	document.getElementById('finish-button').disabled = true;

	createClassButtons();
	createAnnotationCanvas();

}



// Function to initialize the application
function init() {
	// Add event listeners or any other initialization logic here
	preloadImages(appImagesUrls);

	// DEBUG display tutorial from the start
	//displayTutorial();

	// check local storage for the user id
	userId = localStorage.getItem('user');
	userId = "dummyuser"
	state = loadStateFromLocalStorage();
	if (state !== null) {
		// load session data from the server
		initializeTest(state);
	}

	// DEPRECATED
	// Add event listener to the start button
	document.getElementById('start-button').addEventListener('click', function () {
		switchScreen('annotate-screen');
		loadImages("dataset/valid/dataset.json");
		createAnnotationCanvas();
	});


	addEventListener("resize", function () {
		if (currentScreen === 'annotate-screen') {
			createAnnotationCanvas();
		} else if (currentScreen === 'tutorial-screen') {
			createAnnotationCanvas("tutorial");
		}
	});

	// Add event listener to the start trial button
	document.getElementById('start-trial-button').addEventListener('click', function () {
		startTrial();
	});

	// Add event listener to the start test button
	document.getElementById('start-test-button').addEventListener('click', function () {
		initializeTest()
	});

	// Add event listener to the submit form button
	document.getElementById('submit-candidate-form-button').addEventListener('click', validateFormFields);

	// bind keyboard hotkeys
	document.addEventListener('keydown', function (event) {
		if (currentScreen === 'annotate-screen') {
			switch(event.key) {
				case 'ArrowRight':
					nextImage();
					break;
				case 'ArrowLeft':
					previousImage();
					break;
				case 'Escape':
					if(isEditing) {
						stopEditing();
					}
					break;
				case '1':
					selectClass(1);
					break;
				case '2':
					selectClass(2);
					break;
				case '3':
					selectClass(3);
					break;
				case '4':
					selectClass(4);
					break;
				case '5':
					selectClass(5);
					break;
				}
		}
	});	

}

// Call init function when the page is loaded
window.onload = init;
