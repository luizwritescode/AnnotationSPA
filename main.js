// Define global variables
let currentScreen = 'menu'; // Variable to keep track of the current screen (menu or annotate)

const screens = ['menu-screen', 'annotate-screen', 'form-screen', 'tutorial-screen']; // List of all screens in the application


var userId = null;

// Function to switch between screens
function switchScreen(screen) {
	// Hide all screens except the one that is passed as an argument
	screens.forEach(function(s) {
		if (s === screen) {
			document.getElementById(s).style.display = 'flex';
		} else {
			document.getElementById(s).style.display = 'none';
		}
	});
}


// Function that starts a new trial flow
function startTrial() {
	// Switch to the form screen
	switchScreen('form-screen');

	// Switch to the tutorial screen
	//displayTutorial();

	// Switch to the annotate screen
	//initializeTest();
}

function initializeTest(state=null) {

	//reset variables
	isPointerLocked = false;
	isDrawing = false;
	isEditing = false;
	editRectangleId = null;
	startX, startY;
	selectedClass = null

	currentIndex = state ? state.currentIndex : 0;
	currentImageId = ""
	images = state ? state.images : [];

	rectangles = [];
	rectangle;

	annotCount = 0;

	annotations = state ? state.annotations : {};

	switchScreen('annotate-screen');


	// Load the images
	loadImages("dataset/test/dataset.json");

	debugger
	startTimestamp = state ? startTimer(state.startTimestamp) : startTimer();
	console.log(startTimestamp);

	//disable the finish button
	document.getElementById('finish-button').disabled = true;
	// Create the annotation canvas
	createClassButtons();
	createAnnotationCanvas();


}

// Function to initialize the application
function init() {
    // Add event listeners or any other initialization logic here

	// check local storage for the user id
	userId = localStorage.getItem('userId');
	userId = "dummyuser"
	var state = loadStateFromLocalStorage();
	if (state !== null) {
		// load session data from the server
		initializeTest(state);
	}

	// Add event listener to the start button
	document.getElementById('start-button').addEventListener('click', function() {
		switchScreen('annotate-screen');
		loadImages("dataset/valid/dataset.json");
		createAnnotationCanvas();
	});


	addEventListener("resize", function() {
		if (currentScreen === 'annotate') {
			createAnnotationCanvas();
		}
	});

	// Add event listener to the start trial button
	document.getElementById('start-trial-button').addEventListener('click', function() {
		startTrial();
	});

	// Add event listener to the submit form button
	document.getElementById('submit-candidate-form-button').addEventListener('click', validateFormFields);
	
}

// Call init function when the page is loaded
window.onload = init;
