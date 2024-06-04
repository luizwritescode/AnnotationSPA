const imageContainer = document.getElementById("image-container");
const annotationArea = document.getElementById("annotation-area");
const annotationList = document.getElementById("annotation-list");
const nextButton = document.getElementById("next-button");
const previousButton = document.getElementById("previous-button");
const finishButton = document.getElementById("finish-button");

var isPointerLocked = false;
var isDrawing = false;
var isEditing = false;
var editRectangleId = null;
var startX, startY;
var selectedClass = null;

var currentIndex = 0;
var currentImageId = ""
var images = [];

var rectangles = [];
var rectangle;

var annotCount = 0;

var annotations = {};

var startTimestamp = null

function loadImages(filename) {
	fetch(filename)
		.then(response => response.json())
		.then(data => {
			images = data;
			document.getElementById("image-counter").innerHTML = (currentIndex + 1) + "/" + images.length;
			showImage(images[currentIndex]);
			console.log(images[currentIndex]["image_path"])
		})
		.catch(error => {
			console.error('Error:', error);
		});


}

function showImage(jsonEntry) {
	// remove the previous image
	var image = document.getElementById("annotation-image");
	image.src = jsonEntry.image_path;

	// remove the previous annotations
	annotationList.innerHTML = "";
	annotationArea.innerHTML = "";

	//reset modes
	isEditing = false;
	isDrawing = false;

	// add the annotations for this image
	filename = jsonEntry.image_path.split("\\").pop();

	// update current image filename
	currentImageId = filename;

	if (annotations[filename] !== undefined) {
		for (var i = 0; i < annotations[filename].length; i++) {
			
			annot = annotations[filename][i];

			var rect = document.createElement("div");
			rect.className = "rectangle";
			rect.id = Math.random().toString(36).substring(3);
			rect.style.position = "absolute";
			rect.style.left = annot.x_center * 500 - annot.width * 500 / 2 + "px";
			rect.style.top = annot.y_center * 500 - annot.height * 500 / 2 + "px";
			rect.style.width = annot.width * 500 + "px";
			rect.style.height = annot.height * 500 + "px";

			switch(annot.class) {
				case "rebarba":
					rect.classList.add("red-border");
					break;
				case "rachadura":
					rect.classList.add("blue-border");
					break;
				case "perfuração":
					rect.classList.add("green-border");
					break;
				case "não polida":
					rect.classList.add("orange-border");
					break;
				case "sem defeito":
					rect.classList.add("purple-border");
					break;
			}

			annotationArea.appendChild(rect);

			// add the annotation to the annotation list
			addAnnotation(filename, annot, rect.id);


		}
	}
}

function nextImage() {
	if (currentIndex < images.length - 1) {
		currentIndex++;
		document.getElementById("image-counter").innerHTML = (currentIndex + 1) + "/" + images.length;
		showImage(images[currentIndex]);
	}

	selectedClass = null;

	console.log(annotations)

	document.getElementById("class-buttons").childNodes.forEach(function(button) {
		button.classList.remove("ativo");
	})

	//check if all images have been annotated
	if ( Object.values(annotations).length === images.length) {
		finishButton.disabled = false;
	}
}

function previousImage() {
	if (currentIndex > 0) {
		currentIndex--;
		document.getElementById("image-counter").innerHTML = (currentIndex + 1) + "/" + images.length;
		showImage(images[currentIndex]);
	}

	selectedClass = null;

	document.getElementById("class-buttons").childNodes.forEach(function(button) {
		button.classList.remove("ativo");
	})

	//check if all images have been annotated
	if ( Object.values(annotations).length === images.length) {
		finishButton.disabled = false;
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

	editButton.onclick = function() {

		annotation.isEditing = !annotation.isEditing;

		if (annotation.isEditing) {
			editButton.classList.add("ativo");
			editAnnotation(annotation, rectangleId);

			// remove the class "ativo" from the other buttons
			document.querySelectorAll("#annotation-list button").forEach(function(button) {
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
			Array.prototype.slice.call(rects).forEach(function(rect) {
				if (rect.id !== rectangleId) {
					var anchors = rect.getElementsByClassName("anchor");
					Array.prototype.slice.call(anchors).forEach(function(anchor) {
						rect.removeChild(anchor);
					});
				}
			});


		} else {
			editButton.classList.remove("ativo");

			// remove the anchors from the rectangle
		
			var rect = document.getElementById(rectangleId);
			var anchors = rect.getElementsByClassName("anchor")
			Array.prototype.slice.call(anchors).forEach(function(anchor) {
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

	deleteButton.onclick = function() {

		if(annotation.isEditing) {
			isEditing = false;
		}

		// get image filename
		var image = document.getElementById("annotation-image");
		var imageFilename = image.src.split("/").pop();

		removeAnnotation(imageFilename, annotation, annotationItem, rectangleId);
	}

	buttons.appendChild(deleteButton);

	annotationItem.appendChild(buttons);

	annotationList.appendChild(annotationItem);

	annotCount++;
}

function stopEditing() {
	isEditing = false;

	// remove the class "ativo" from all buttons
	document.querySelectorAll("#annotation-list button").forEach(function(button) {
		button.classList.remove("ativo");
	});

	// remove isEditing from all annotations
	for (var i = 0; i < annotations[currentImageId].length; i++) {
		annotations[currentImageId][i].isEditing = false;
	}

	
	// remove anchors from all rectangles
	var rects = annotationArea.getElementsByClassName("rectangle");
	Array.prototype.slice.call(rects).forEach(function(rect) {
		
		var anchors = rect.getElementsByClassName("anchor");
		Array.prototype.slice.call(anchors).forEach(function(anchor) {
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
        annotation.x_center = ( (rectBounds.left - annotationArea.getBoundingClientRect().left ) + rectBounds.width / 2) / 500;
        annotation.y_center = ( (rectBounds.top - annotationArea.getBoundingClientRect().top ) + rectBounds.height / 2) / 500;
        annotation.width = rectBounds.width / 500;
        annotation.height = rectBounds.height / 500;

		if (annotation.width > 1.0 ) {
			annotation.width = 1.0;
		} else if (annotation.height > 1.0) {
			annotation.height = 1.0;
		}




		console.log(annotation.x_center, annotation.y_center, annotation.width, annotation.height)


		// console.log(newX, newY, newWidth, newHeight)

        // Update the position of other anchors
        updateAnchors();
    }

    // Function to update the position of anchors, place them at the middle of the edges of the rectangle
	function updateAnchors() {
        var rectBounds = rect.getBoundingClientRect();
		anchors[0].style.left =( rectBounds.width / 2 )-10+ 'px';
		anchors[0].style.top = '-10px';
		anchors[1].style.left = rectBounds.width  - 10 + 'px';
		anchors[1].style.top = rectBounds.height / 2 - 10 + 'px';
		anchors[2].style.left = '-10px';
		anchors[2].style.top = rectBounds.height / 2 - 10 + 'px';
		anchors[3].style.left = rectBounds.width / 2 - 10 + 'px';
		anchors[3].style.top = rectBounds.height - 10 + 'px';


    }

    // Event listeners for anchor dragging
    anchors.forEach(function(anchor) {
        anchor.addEventListener('mousedown', function(event) {
            event.preventDefault();
            event.stopPropagation();

			initialClientX = event.clientX;
			initialClientY = event.clientY;
			initialHeight = rect.getBoundingClientRect().height;
			initialWidth = rect.getBoundingClientRect().width;

			function wrapper(event) {
				updateAnnotation(event, initialClientX, initialClientY, initialHeight, initialWidth,anchor.id);
			}

            document.addEventListener('mousemove', wrapper);
            document.addEventListener('mouseup', function() {
				console.log("mouseup")
                document.removeEventListener('mousemove', wrapper);

				saveStateToLocalStorage();
            });
        });
    });

    // Update the position of anchors initially
    updateAnchors();
}

function createClassButtons(screen="annotate") {

	var classColors = {
		"rebarba": "red",
		"rachadura": "blue",
		"perfuração": "green",
		"não polida": "orange",
		"sem defeito": "purple"
	};

	var classes = ["rebarba", "rachadura", "perfuração", "não polida", "sem defeito"];
	var targetId = screen === "annotate" ? "class-buttons" : "class-buttons-tutorial";
	var classButtons = document.getElementById(targetId);
	for (var i = 0; i < classes.length; i++) {
		var button = document.createElement("button");
		button.innerHTML = classes[i];
		button.className = "btn " + classColors[classes[i]] + "-border " + "btn-large";
		button.onclick = screen === "annotate" ? chooseClassButton : chooseClassButtonTutorial;

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


function createAnnotationCanvas(screen="annotate") {
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
		alert("Selecione uma classe antes de começar a desenhar");
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

function drawRectangle(event)
{
	if (!isDrawing) return;

	var x = event.clientX - annotationArea.getBoundingClientRect().left;
	var y = event.clientY - annotationArea.getBoundingClientRect().top;

	var width = Math.abs(x - startX);
	var height = Math.abs(y - startY);

	if(rectangle === undefined) {
		rectangle = document.createElement("div");
		rectangle.style.position = "absolute";
		rectangle.className = "rectangle";
		//random id
		rectangle.id = Math.random().toString(36).substring(3);

		switch(selectedClass) {
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
	} else if ( x > annotationArea.clientWidth) {
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
	rectangle.style.left = Math.min(startX,x)+ "px";
	rectangle.style.top =  Math.min(startY,y) + "px";
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

	if ( startX <= endX && startY <= endY) {
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

	var xCenter = (startX + width/2) / imageWidth;
	var yCenter = (startY + height/2) / imageHeight;
	var w = width / imageWidth;
	var h = height / imageHeight;

	const annotation = {
		class: selectedClass,
		x_center: xCenter,
		y_center: yCenter,
		width: Math.abs(w),
		height: Math.abs(h),
		isEditing: false
	}

	console.log(startX, startY, width, height)
	console.log(annotation.x_center, annotation.y_center, annotation.width, annotation.height)
	// get image filename
	var image = document.getElementById("annotation-image");
	var imageFilename = image.src.split("/").pop();

	if (annotations[imageFilename] === undefined) {
		annotations[imageFilename] = [];
	}

	if(annotation.width === 0 || annotation.height === 0) {
		console.log("Tentou criar anotação com largura ou altura 0, não salva a anotação")
		return
	}

	annotations[imageFilename].push(annotation);

	addAnnotation(imageFilename, annotation, rectangle.id);

	rectangle = undefined;

	saveStateToLocalStorage();
}

function saveAs(blob, filename) {
	var url = URL.createObjectURL(blob);
	var a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 0);
}


function finishAnnotating() {

	var zip = new JSZip();
	// save annotations to a file for each image
	for (const [key, value] of Object.entries(annotations)) { 
		var annotationsForImage = value;
		var lines = [];

		for (var i = 0; i < annotationsForImage.length; i++) {
			var annotation = annotationsForImage[i];

			var classMap = {"rebarba": 0, "rachadura": 1, "perfuração": 2, "não polida": 3, "sem defeito": 4}
			var classId = classMap[annotation.class];

			var line = classId + " " + annotation.x_center + " " + annotation.y_center + " " + annotation.width + " " + annotation.height + "\n";
			lines.push(line);
		}

		// relace .jpg with .txt
		let filename = key.replace(".jpg", ".txt");
		zip.file(filename, lines.join(""));
	};
	
	zip.generateAsync({type:"blob"})
	.then(function(content) {
		saveAs(content, "annotations.zip");
	});

	clearStateFromLocalStorage();
}


document.addEventListener("pointerlockchange", function() {
	isPointerLocked = document.pointerLockElement === annotationArea || document.mozPointerLockElement === annotationArea;
});


nextButton.addEventListener("click", nextImage);
previousButton.addEventListener("click", previousImage);
finishButton.addEventListener("click", finishAnnotating);

annotationArea.addEventListener("mousedown", startDrawing);
annotationArea.addEventListener("mousemove", drawRectangle);
annotationArea.addEventListener("mouseup", finishDrawing);




document.addEventListener("mouseup", function() {
	if (isDrawing) {
		isDrawing = false;
		alert("Tentou terminar o desenho fora da area de anotação. Segure o mouse, arraste, e só solte dentro da area de anotação. (É a caixa verde ao redor da imagem)");
		
		//remove last rectangle in annotation area
		let _rectangle = rectangles.pop();
		annotationArea.removeChild(_rectangle);
		rectangle = undefined;
	}
});


function startTimer(startTimestamp) {
	var timer = document.getElementById("timer");
	var timestamp = startTimestamp ? startTimestamp : new Date().getTime();
	setInterval(function() {
		
		var time = Math.floor((new Date().getTime() - timestamp) / 1000);
		//convert to 00:00:00 format
		var hours = Math.floor(time / 3600);
		var minutes = Math.floor(time / 60);
		var seconds = time % 60;

		timer.innerHTML = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
	}, 1000);

	return timestamp;
}


function saveStateToLocalStorage() {
	console.log('saving state to local storage')
	localStorage.setItem('userId', userId);

	var state = {
		startTimestamp: startTimestamp,
		currentIndex: currentIndex,
		images: images,
		annotations: annotations
	}

	localStorage.setItem('state', JSON.stringify(state));

}

function loadStateFromLocalStorage() {
	var state = JSON.parse(localStorage.getItem('state'));
	if (state !== null) {
		startTimestamp = state.startTimestamp;
		currentIndex = state.currentIndex;
		images = state.images;
		annotations = state.annotations;
	}
	console.log(state)
	return state;
}

function clearStateFromLocalStorage() {
	localStorage.removeItem('state');
}