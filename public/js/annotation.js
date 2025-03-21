// classes for the annotations
// 0 - rebarba
// 1 - rachadura
// 2 - perfuração
// 3 - não polida
// 4 - sem defeito


const imageContainer = document.getElementById("image-container");
const annotationArea = document.getElementById("annotation-area");
const annotationList = document.getElementById("annotation-list");
const nextButton = document.getElementById("next-button");
const previousButton = document.getElementById("previous-button");
const finishButton = document.getElementById("finish-button");
const showAnswerButton = document.getElementById("show-answer-button");

var trainingMode = false;
var isPointerLocked = false;
var isDrawing = false;
var isEditing = false;
var editRectangleId = null;
var startX, startY;
var selectedClass = null;

var testLength = 0;

var currentIndex = 0;
var currentImageId = ""
var images = [];

var rectangles = [];
var rectangle;

var annotCount = 0;

var annotations = {};

var startTimestamp = null

var groundTruthSeen = false

// returns the integer value of how many images are left without annotations
function getRemainingImages(length = 30) {
	let vals = Object.values(annotations)
	let count = 0;
	vals.forEach(annot => {
		if (annot.length != 0) {
			count++;
		}
	});
	debugger;
	return length - count;
}

function loadImages(_images) {
	images = _images;
	document.getElementById("image-counter").innerHTML = (currentIndex + 1) + "/" + images.length;
	document.getElementById("remaining-counter").innerHTML = getRemainingImages(images.length);
	showImage(images[currentIndex]);
	//console.log(images[currentIndex]["image_path"])
}

// IM NOT SURE IF THIS SHOULD RANDOMIZE THE IMAGE ORDER
async function useAllTestImages(manifestPath, target="test30", useBonus=false, debugMode=false) {
	return fetch(manifestPath)
		.then(response => response.json())
		.then(data => {
			let testImages = [];

			data[target].forEach(function (imageData) {
				const img = new Image();
				img.src = imageData["image_path"];
				img.ground_truth = imageData["annotation_data"];
				testImages.push(img);
			});
			
			// includes bonus test images with not seen before ground truth annotations
			if (useBonus) {
				data["testbonus"].forEach(function (imageData) {
					const img = new Image();
					img.src = imageData["image_path"];
					img.ground_truth = imageData["annotation_data"];
					testImages.push(img);
				});
			}

			document.getElementById("image-counter").innerHTML = (currentIndex + 1) + "/" + images.length;
			document.getElementById("remaining-counter").innerHTML = getRemainingImages(images.length);

			return Promise.resolve(testImages);
		})
}

async function pickTestImages(manifestPath, target = "all", minImagesPerClass = 10, debugMode = false) {


	return fetch(manifestPath)
		.then(response => response.json())
		.then(data => {
			if (target !== "all") {
				data = data[target]
			} else {
				// merge all targets
				data = data["train"].concat(data["valid"]).concat(data["test"]);
			}

			// we want a balanced dataset of minumum 10 images per class
			let classCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
			let pickedImages = [];
			let pickedIndexes = [];

			// array from 0 to data.length
			let indexes = Array.from({ length: Object.keys(data).length }, (v, k) => k);

			// shuffle the indexes
			let shuffledIndexes = shuffle(indexes);

			shuffledIndexes.forEach(function (index) {


				data[index]["annotation_data"].forEach(function (annotation) {

					let imgClass = annotation["class_id"];


					if (classCount[imgClass] < minImagesPerClass && !pickedIndexes.includes(index)) {
						const img = new Image();
						img.src = data[index]["image_path"];
						img.ground_truth = data[index]["annotation_data"];

						pickedIndexes.push(index);


						pickedImages.push(img);

						classCount[imgClass] += 1;
						// for debugging add the img html element to the body
						if (debugMode) {
							document.body.appendChild(img);
						}
					}
				});


			})

			if (debugMode) {

				console.log(pickedImages.length)
				console.log(classCount)
				let imageNames = ""
				pickedImages.forEach(_img => {
					//log the last substring of the image path
					imageNames += _img.src.split("/").pop() + "\n"
				})
				console.log(imageNames)
			}

			// return the picked images for the Promise
			return Promise.resolve(pickedImages);
		})
}


function loadTrainingImages() {
	let trainingImageFiles = [];
	for (let i = 0; i < 7; i++) {
		trainingImageFiles.push(`treinamento${i}.jpg`);
	}

	// return only the image values from loadedImages object that match the trainingImageFiles
	let trainingImages = Object.values(loadedImages).filter(image => trainingImageFiles.includes(image.src.split("/").pop()));

	// read the training image annotations from txt files

	trainingImages.forEach(timage => {

		let filename = timage.src.split("/").pop().replace(".jpg", ".txt");
		fetch(`img/treinamento/${filename}`)
			.then(response => response.text())
			.then(data => {
				let annotations = data.split("\n");
				annotations = annotations.filter(annotation => annotation !== "");
				annotations = annotations.map(annotation => {
					let parts = annotation.split(" ");
					return {
						class: parts[0],
						x_center: parseFloat(parts[1]),
						y_center: parseFloat(parts[2]),
						width: parseFloat(parts[3]),
						height: parseFloat(parts[4])
					}
				});

				//save the annotations to the image object itself
				timage["groundTruth"] = annotations;
			})
			.catch(error => {
				console.error('Error:', error);
			});
	});


	document.getElementById("image-counter").innerHTML = (currentIndex + 1) + "/" + trainingImages.length;
	document.getElementById("remaining-counter").innerHTML = getRemainingImages(trainingImages.length);
	showImage(trainingImages[currentIndex]);
	return trainingImages;
}

function showImage(image) {
	debugger
	// remove the previous image
	var imageContainer = document.getElementById("annotation-image");
	imageContainer.src = image.src;

	// remove the previous annotations
	annotationList.innerHTML = "";
	annotationArea.innerHTML = "";

	//reset modes
	isEditing = false;
	isDrawing = false;
	groundTruthSeen = false;
	//document.getElementById("ground-truth-indicator").children[0].style.display = "none";


	// add the annotations for this image
	filename = image.src.split("/").pop();

	// update current image filename
	currentImageId = filename;

	if (annotations[filename] !== undefined) {
		for (var i = 0; i < annotations[filename].length; i++) {

			annot = annotations[filename][i];

			// render the rectangle
			rect = renderRectangle(annot);

			// add the annotation to the annotation list
			addAnnotation(filename, annot, rect.id);


		}
	}
}

function renderRectangle(annot) {
	var rect = document.createElement("div");
	rect.className = "rectangle";
	rect.id = Math.random().toString(36).substring(3);
	rect.style.position = "absolute";
	rect.style.left = annot.x_center * 500 - annot.width * 500 / 2 + "px";
	rect.style.top = annot.y_center * 500 - annot.height * 500 / 2 + "px";
	rect.style.width = annot.width * 500 + "px";
	rect.style.height = annot.height * 500 + "px";

	switch (annot.class) {
		case '0': // rebarba
		case 'rebarba':
			rect.classList.add("red-border");
			break;
		case '1': // rachadura
		case 'rachadura':
			rect.classList.add("blue-border");
			break;
		case '2': // perfuração
		case 'perfuração':
			rect.classList.add("green-border");
			break;
		case '3': // não polida
		case 'não polida':
			rect.classList.add("orange-border");
			break;
		case '4': // sem defeito
		case 'sem defeito':
			rect.classList.add("purple-border");
			break;
	}

	annotationArea.appendChild(rect);

	return rect
}

// hides user annotations and  shows the answer while the button is pressed
function showGroundTruthAnnotations(image) {
	annotationArea.classList.add("answer-overlay");

	// remove the previous annotations
	annotationList.innerHTML = "";
	annotationArea.innerHTML = "";

	//reset modes
	isEditing = false;
	isDrawing = false;

	// show the ground truth annotations
	let groundTruth = image.groundTruth;

	for (var i = 0; i < groundTruth.length; i++) {
		annot = groundTruth[i];
		// render the rectangle
		rect = renderRectangle(annot);
	}
}

// hides the answer and shows the user annotations back again
function hideGroundTruthAnnotations() {
	annotationArea.classList.remove("answer-overlay");	

	// remove all rectangles from annotation area
	annotationArea.innerHTML = "";
	annotationList.innerHTML = "";

	// reset modes
	isEditing = false;
	isDrawing = false;

	// render the annotations for the current image
	if (annotations[currentImageId] !== undefined) {
		for (var i = 0; i < annotations[currentImageId].length; i++) {
			annot = annotations[currentImageId][i];
			// render the rectangle
			rect = renderRectangle(annot);
			// add the annotation to the annotation list
			addAnnotation(currentImageId, annot, rect.id);
		}
	}
}


function nextImage() {
	debugger
	if (currentIndex < images.length - 1) {
		currentIndex++;
		document.getElementById("image-counter").innerHTML = (currentIndex + 1) + "/" + images.length;
		selectedClass = null;
		document.getElementById("class-buttons").childNodes.forEach(function (button) {
			button.classList.remove("ativo");
		})
		console.log(annotations)
		showImage(images[currentIndex]);
	}



}

function previousImage() {
	if (currentIndex > 0) {
		currentIndex--;
		document.getElementById("image-counter").innerHTML = (currentIndex + 1) + "/" + images.length;
		selectedClass = null;
		document.getElementById("class-buttons").childNodes.forEach(function (button) {
			button.classList.remove("ativo");
		})
		showImage(images[currentIndex]);
	}

}


function addAnnotation(imageId, annotation, rectangleId) {

	// count the number of annotations for this image of this class
	var count = 0;
	for (var i = 0; i < annotations[imageId].length; i++) {
		if (annotations[imageId][i].class === annotation.class) {
			count++;
		}
	}

	// create a new annotation list item

	var annotationItem = document.createElement("div");
	annotationItem.className = "annotation-list-item";
	var annotationText = document.createElement("span");
	annotationText.innerHTML = annotation.class + " #" + count;
	annotationItem.appendChild(annotationText);

	var buttons = document.createElement("div");

	var editButton = document.createElement("button");
	editButton.innerHTML = "Editar";
	editButton.className = "btn";

	editButton.onclick = function () {

		annotation.isEditing = !annotation.isEditing;

		if (annotation.isEditing) {
			editButton.classList.add("ativo");
			editAnnotation(annotation, rectangleId);

			// remove the class "ativo" from the other buttons
			document.querySelectorAll("#annotation-list button").forEach(function (button) {
				if (button !== editButton) {
					button.classList.remove("ativo");
				}
			});

			// remove isEditing from the other annotations
			for (var i = 0; i < annotations[imageId].length; i++) {
				if (annotations[imageId][i] !== annotation) {
					annotations[imageId][i].isEditing = false;
				}
			}

			// remove anchors from the other rectangles
			var rects = annotationArea.getElementsByClassName("rectangle");
			Array.prototype.slice.call(rects).forEach(function (rect) {
				if (rect.id !== rectangleId) {
					var anchors = rect.getElementsByClassName("anchor");
					Array.prototype.slice.call(anchors).forEach(function (anchor) {
						rect.removeChild(anchor);
					});
				}
			});


		} else {
			editButton.classList.remove("ativo");

			// remove the anchors from the rectangle

			var rect = document.getElementById(rectangleId);
			var anchors = rect.getElementsByClassName("anchor")
			Array.prototype.slice.call(anchors).forEach(function (anchor) {
				rect.removeChild(anchor);
			});

			annotation.isEditing = false;
			isEditing = false;
		}

	}
	buttons.appendChild(editButton);

	var deleteButton = document.createElement("button");
	deleteButton.innerHTML = "Excluir";
	deleteButton.className = "btn";

	deleteButton.onclick = function () {

		if (annotation.isEditing) {
			isEditing = false;
		}

		// get image filename
		var image = document.getElementById("annotation-image");
		var imageFilename = image.src.split("/").pop();

		removeAnnotation(imageFilename, annotation, annotationItem, rectangleId);

		// update the UI counters
		document.getElementById("remaining-counter").innerHTML = getRemainingImages(images.length);
	}

	buttons.appendChild(deleteButton);

	annotationItem.appendChild(buttons);

	annotationList.appendChild(annotationItem);

	annotCount++;
}

function stopEditing() {
	isEditing = false;

	// remove the class "ativo" from all buttons
	document.querySelectorAll("#annotation-list button").forEach(function (button) {
		button.classList.remove("ativo");
	});

	// remove isEditing from all annotations
	for (var i = 0; i < annotations[currentImageId].length; i++) {
		annotations[currentImageId][i].isEditing = false;
	}


	// remove anchors from all rectangles
	var rects = annotationArea.getElementsByClassName("rectangle");
	Array.prototype.slice.call(rects).forEach(function (rect) {

		var anchors = rect.getElementsByClassName("anchor");
		Array.prototype.slice.call(anchors).forEach(function (anchor) {
			rect.removeChild(anchor);
		});
	});

}

function removeAnnotation(imageId, annotation, annotationItem, rectangleId) {

	if (annotations[imageId] === undefined) {
		return;
	}

	var index = annotations[imageId].indexOf(annotation);
	if (index > -1) {
		annotations[imageId].splice(index, 1);
	}

	annotationList.removeChild(annotationItem);

	// remove the rectangle from the annotation area
	var rect = document.getElementById(rectangleId);
	annotationArea.removeChild(rect);

	annotCount--;

	saveStateToLocalStorage();

}


function editAnnotation(annotation, rectangleId) {

	isEditing = true;

	// Get the existing rectangle element
	var rect = document.getElementById(rectangleId);
	if (!rect) {
		return;
	}

	var initialClientX;
	var initialClientY;

	// Add anchors for resizing
	var anchorNames = ['top', 'right', 'left', 'bottom'];
	var anchors = [];
	for (var i = 0; i < 4; i++) {
		var anchor = document.createElement('div');
		anchor.className = 'anchor';
		anchor.id = anchorNames[i];
		rect.appendChild(anchor);
		anchors.push(anchor);
	}

	// Function to update annotation and rectangle based on anchor positions
	function updateAnnotation(event, initialClientX, initialClientY, initialHeight, initialWidth, anchorId) {
		var rectBounds = rect.getBoundingClientRect();
		var newX, newY, newWidth, newHeight;

		// Original position of the top-left corner of the rectangle when the dragging operation begins

		// Update position and dimensions based on anchor position
		switch (anchorId) {
			// user is dragging the top anchor
			case 'top':

				// new position for top anchor of rectangle
				newY = event.clientY - annotationArea.getBoundingClientRect().top;

				//check if the new position is inside the annotation area
				if (newY < 0) {
					newY = 0;
				}

				if (newY + rectBounds.height > annotationArea.clientHeight) {
					newY = annotationArea.clientHeight - rectBounds.height;
				}

				// calculate the new height of the rectangle
				const deltaY = event.clientY - initialClientY;

				if (newY > 0 && rectBounds.height + newY < annotationArea.clientHeight) {
					newHeight = initialHeight - deltaY;
				}

				break;
			case 'right':
				newWidth = event.clientX - rectBounds.left;

				if (newWidth + rectBounds.left > annotationArea.getBoundingClientRect().right) {
					newWidth = annotationArea.getBoundingClientRect().right - rectBounds.left - 1;
				}
				break;
			case 'bottom':
				newHeight = event.clientY - rectBounds.top;

				if (newHeight + rectBounds.top > annotationArea.getBoundingClientRect().bottom) {
					newHeight = annotationArea.getBoundingClientRect().bottom - rectBounds.top - 1;
				}
				break;
			case 'left':

				newX = event.clientX - annotationArea.getBoundingClientRect().left;
				if (newX < 0) {
					newX = 0;
				}

				if (newX + rectBounds.width > annotationArea.clientWidth) {
					newX = annotationArea.clientWidth - rectBounds.width;
				}

				const deltaX = event.clientX - initialClientX;

				if (newX > 0 && rectBounds.width + newX < annotationArea.clientWidth) {
					newWidth = initialWidth - deltaX;
				}
				break;
		}
		// Update rectangle dimensions
		rect.style.left = newX + 'px';
		rect.style.top = newY + 'px';
		rect.style.width = newWidth + 'px';
		rect.style.height = newHeight + 'px';

		rectBounds = rect.getBoundingClientRect();


		// Update annotation YOLOv5 format
		annotation.x_center = ((rectBounds.left - annotationArea.getBoundingClientRect().left) + rectBounds.width / 2) / 500;
		annotation.y_center = ((rectBounds.top - annotationArea.getBoundingClientRect().top) + rectBounds.height / 2) / 500;
		annotation.width = rectBounds.width / 500;
		annotation.height = rectBounds.height / 500;

		if (annotation.width > 1.0) {
			annotation.width = 1.0;
		} else if (annotation.height > 1.0) {
			annotation.height = 1.0;
		}


		annotation.lastEdited = new Date() - new Date(startTimestamp);

		console.log(annotation.x_center, annotation.y_center, annotation.width, annotation.height)

		// console.log(newX, newY, newWidth, newHeight)

		// Update the position of other anchors
		updateAnchors();
	}

	// Function to update the position of anchors, place them at the middle of the edges of the rectangle
	function updateAnchors() {
		var rectBounds = rect.getBoundingClientRect();
		anchors[0].style.left = (rectBounds.width / 2) - 10 + 'px';
		anchors[0].style.top = '-10px';
		anchors[1].style.left = rectBounds.width - 10 + 'px';
		anchors[1].style.top = rectBounds.height / 2 - 10 + 'px';
		anchors[2].style.left = '-10px';
		anchors[2].style.top = rectBounds.height / 2 - 10 + 'px';
		anchors[3].style.left = rectBounds.width / 2 - 10 + 'px';
		anchors[3].style.top = rectBounds.height - 10 + 'px';


	}

	// Event listeners for anchor dragging
	anchors.forEach(function (anchor) {
		anchor.addEventListener('mousedown', function (event) {
			event.preventDefault();
			event.stopPropagation();

			initialClientX = event.clientX;
			initialClientY = event.clientY;
			initialHeight = rect.getBoundingClientRect().height;
			initialWidth = rect.getBoundingClientRect().width;

			function wrapper(event) {
				updateAnnotation(event, initialClientX, initialClientY, initialHeight, initialWidth, anchor.id);
			}

			document.addEventListener('mousemove', wrapper);
			document.addEventListener('mouseup', function () {
				document.removeEventListener('mousemove', wrapper);
				document.removeEventListener('mouseup', arguments.callee);
				saveStateToLocalStorage();
			});
		});
	});

	// Update the position of anchors initially
	updateAnchors();
}

function selectClass(classId) {
	if (isEditing) {
		stopEditing();
	}

	let classmap = { 1: "sem defeito", 2: "não polida", 3: "rebarba", 4: "perfuração", 5: "rachadura" }
	let className = classmap[classId];
	isEditing = false;

	selectedClass = className;

	document.getElementById("class-buttons").childNodes.forEach(function (button) {
		button.classList.remove("ativo");
		if (button.innerHTML === selectedClass) {
			button.classList.add("ativo");
		}
	});
}


function createClassButtons() {

	// deletes class buttons if they already exist
	var classButtons = document.getElementById("class-buttons");
	if (classButtons) {
		classButtons.innerHTML = "";
	}


	// creates class buttons
	var classColors = {
		"rebarba": "red",
		"rachadura": "blue",
		"perfuração": "green",
		"não polida": "orange",
		"sem defeito": "purple"
	};

	var classes = ["sem defeito", "não polida", "rebarba", "perfuração", "rachadura"];
	var targetId = "class-buttons";
	var classButtons = document.getElementById(targetId);
	for (var i = 0; i < classes.length; i++) {
		var button = document.createElement("button");
		button.innerHTML = classes[i];
		button.className = "btn " + classColors[classes[i]] + "-border " + "btn-large";
		button.onclick = chooseClassButton;

		classButtons.appendChild(button);
	}
}

// a onclick callback that sets the class of the selected annotation button to "ativo" and removes the class "ativo" from the other buttons
function chooseClassButton() {
	var buttons = document.getElementById("class-buttons").getElementsByTagName("button");
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].classList.remove("ativo");
	}
	this.classList.add("ativo");

	selectedClass = this.innerHTML;

	if (isEditing) {
		stopEditing();
	}
	isEditing = false;
}


function createAnnotationCanvas(screen = "annotate") {
	var areaTargetId = screen === "annotate" ? "annotation-area" : "annotation-area-tutorial";
	var imageTargetId = screen === "annotate" ? "annotation-image" : "annotation-image-tutorial";
	var area = document.getElementById(areaTargetId);
	var image = document.getElementById(imageTargetId);

	// set top and left of the canvas to the top and left of the image
	var top = image.offsetTop;
	var left = image.offsetLeft;
	var width = image.clientWidth;
	var height = image.clientHeight;

	area.style.top = top + "px";
	area.style.left = left + "px";
	area.style.width = width + "px";
	area.style.height = height + "px";
}


function startDrawing(event) {

	if (selectedClass === null) {
		modalAlert("Selecione uma classe antes de começar a desenhar");
		setTimeout(function () { document.documentElement.requestFullscreen() });
		return;
	}

	if (isEditing) {
		return;
	}

	// annotationArea.requestPointerLock = annotationArea.requestPointerLock || annotationArea.mozRequestPointerLock;
	// annotationArea.requestPointerLock();

	isDrawing = true;
	startX = event.clientX - annotationArea.getBoundingClientRect().left;
	startY = event.clientY - annotationArea.getBoundingClientRect().top;

}

function drawRectangle(event) {
	if (!isDrawing) return;

	var x = event.clientX - annotationArea.getBoundingClientRect().left;
	var y = event.clientY - annotationArea.getBoundingClientRect().top;

	var width = Math.abs(x - startX);
	var height = Math.abs(y - startY);

	if (rectangle === undefined) {
		rectangle = document.createElement("div");
		rectangle.style.position = "absolute";
		rectangle.className = "rectangle";
		//random id
		rectangle.id = Math.random().toString(36).substring(3);

		switch (selectedClass) {
			case "rebarba":
				rectangle.classList.add("red-border");
				break;
			case "rachadura":
				rectangle.classList.add("blue-border");
				break;
			case "perfuração":
				rectangle.classList.add("green-border");
				break;
			case "não polida":
				rectangle.classList.add("orange-border");
				break;
			case "sem defeito":
				rectangle.classList.add("purple-border");
				break;
		}
		annotationArea.appendChild(rectangle);
		rectangles.push(rectangle);
	}

	// check bounds of the annotation area
	if (x < 0) {
		x = 0;
	} else if (x > annotationArea.clientWidth) {
		x = annotationArea.clientWidth;
		width = annotationArea.clientWidth - startX;
	}

	if (y < 0) {
		y = 0;
	} else if (y > annotationArea.clientHeight) {
		y = annotationArea.clientHeight;
		height = annotationArea.clientHeight - startY;
	}


	console.log(x, y, width, height)
	rectangle.style.left = Math.min(startX, x) + "px";
	rectangle.style.top = Math.min(startY, y) + "px";
	rectangle.style.width = width + "px";
	rectangle.style.height = height + "px";

}


function finishDrawing(event) {

	if (!isDrawing) return;

	isDrawing = false;

	var endX = event.clientX - annotationArea.getBoundingClientRect().left;
	var endY = event.clientY - annotationArea.getBoundingClientRect().top;

	var width = Math.abs(event.clientX - annotationArea.getBoundingClientRect().left - startX);
	var height = Math.abs(event.clientY - annotationArea.getBoundingClientRect().top - startY);


	// save annotation in YOLOv5 format

	var imageWidth = 500;
	var imageHeight = 500;

	if (startX <= endX && startY <= endY) {
		// top left to bottom right
	} else if (startX > endX && startY <= endY) {
		// top right to bottom left
		startX = endX;
	} else if (startX <= endX && startY > endY) {
		// bottom left to top right
		startY = endY;
	} else {
		// bottom right to top left
		startX = endX;
		startY = endY;
	}

	var xCenter = (startX + width / 2) / imageWidth;
	var yCenter = (startY + height / 2) / imageHeight;
	var w = width / imageWidth;
	var h = height / imageHeight;

	const annotation = {
		class: selectedClass,
		x_center: xCenter,
		y_center: yCenter,
		width: Math.abs(w),
		height: Math.abs(h),
		isEditing: false,
		lastEdited: new Date() - new Date(startTimestamp)
	}

	console.log(startX, startY, width, height)
	console.log(annotation.x_center, annotation.y_center, annotation.width, annotation.height)
	// get image filename
	var image = document.getElementById("annotation-image");
	var imageFilename = image.src.split("/").pop();

	if (annotations[imageFilename] === undefined) {
		annotations[imageFilename] = [];
	}

	if (annotation.width === 0 || annotation.height === 0) {
		console.log("Tentou criar anotação com largura ou altura 0, não salva a anotação")
		return
	}

	annotations[imageFilename].push(annotation);

	addAnnotation(imageFilename, annotation, rectangle.id);
	
	// update the UI counters
	document.getElementById("remaining-counter").innerHTML = getRemainingImages(images.length);

	// reset vars for next drawing
	rectangle = undefined;

	saveStateToLocalStorage();

	// enable finish button if all images have annotations
	if (checkIfFinished()) {
		document.getElementById('finish-button').disabled = false;
		modalAlert("Todas as imagens foram anotadas. Botão Finalizar liberado.");
	}
}

function saveAs(blob, filename) {
	var url = URL.createObjectURL(blob);
	var a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(function () {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 0);
}


function finishAnnotating() {

	//check if not finished
	var check = checkIfFinished();
	if (!check) {
		modalAlert("Ainda existem imagens sem anotações. Por favor, anote todas as imagens antes de finalizar.");
		return
	}

	// disable the finishe button so double clicking doesn't send the annotations twice
	finishButton.disabled = true;

	var zip = new JSZip();
	// save annotations to a file for each image
	for (const [key, value] of Object.entries(annotations)) {
		var annotationsForImage = value;
		var lines = [];

		for (var i = 0; i < annotationsForImage.length; i++) {
			var annotation = annotationsForImage[i];

			var classMap = { "rebarba": 0, "rachadura": 1, "perfuração": 2, "não polida": 3, "sem defeito": 4 }
			var classId = classMap[annotation.class];

			var line = classId + " " + annotation.x_center + " " + annotation.y_center + " " + annotation.width + " " + annotation.height + "\n";
			lines.push(line);
		}

		// relace .jpg with .txt
		let filename = key.replace(".jpg", ".txt");
		zip.file(filename, lines.join(""));
	};

	if (!trainingMode && check) {
		zip.generateAsync({ type: "blob" })
			.then(function (content) {
				saveAs(content, "annotations.zip");
			});

		// send annotations to server
		let candidateId = localStorage.getItem('candidateId');
		db.collection('annotations').add({ annotations: annotations, candidate: candidateId, start_timestamp: new Date(startTimestamp), end_timestamp: new Date() })
			.then(function (docRef) {
				console.log('Document written with ID: ', docRef.id)

				// reset the application state
				clearStateFromLocalStorage();

				localStorage.removeItem('candidateId');
				currentUser = undefined

				switchScreen('menu-screen')
			})
			.catch(function (error) {
				console.error('Error adding document: ', error);
				alert('Erro ao enviar dados. Por favor, notifique a pessoa instrutora.');
			});


	}
	else if (trainingMode && check) {
		switchScreen("training-end-screen");
	}
}


document.addEventListener("pointerlockchange", function () {
	isPointerLocked = document.pointerLockElement === annotationArea || document.mozPointerLockElement === annotationArea;
});


nextButton.addEventListener("click", nextImage);
previousButton.addEventListener("click", previousImage);
finishButton.addEventListener("click", finishAnnotating);
showAnswerButton.addEventListener("mousedown", () => showGroundTruthAnnotations(images[currentIndex]));
showAnswerButton.addEventListener("mouseup", () => hideGroundTruthAnnotations());

annotationArea.addEventListener("mousedown", startDrawing);
annotationArea.addEventListener("mousemove", drawRectangle);
annotationArea.addEventListener("mouseup", finishDrawing);




document.addEventListener("mouseup", function () {
	if (isDrawing) {
		isDrawing = false;
		modalAlert("Tentou terminar o desenho fora da area de anotação. Segure o mouse, arraste, e só solte dentro da area de anotação. (É a caixa verde ao redor da imagem)");

		//remove last rectangle in annotation area
		let _rectangle = rectangles.pop();
		annotationArea.removeChild(_rectangle);
		rectangle = undefined;
	}
});


function startTimer(startTimestamp) {
	var timer = document.getElementById("timer");
	var timestamp = startTimestamp ? startTimestamp : new Date().getTime();
	setInterval(function () {

		var time = Math.floor((new Date().getTime() - timestamp) / 1000);
		//convert to 00:00:00 format
		var seconds = time % 60;
		var minutes = Math.floor(time / 60) % 60;
		var hours = Math.floor(time / 3600);

		timer.innerHTML = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
	}, 1000);

	return timestamp;
}


function checkIfFinished() {
	let vals = Object.values(annotations)
	if (vals.length < testLength) {
		return false;
	}

	isFinished = true;
	vals.forEach(annot => {
		if (annot.length < 1) {
			isFinished = false;
		}
	});
	return isFinished;
}