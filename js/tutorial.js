

const imageContainerTutorial = document.getElementById('image-container-tutorial');
const annotationAreaTutorial = document.getElementById("annotation-area-tutorial");
const annotationListTutorial = document.getElementById("annotation-list-tutorial");
const annotationImageTutorial = document.getElementById("annotation-image-tutorial");
const controlSectionTutorial = document.getElementById("control-section-tutorial");

const nextImageTutorialButton = document.getElementById("next-image-button-tutorial");
const previousImageTutorialButton = document.getElementById("previous-image-button-tutorial");

const tutorialTexts = [
	"Antes de começar, vamos passar por um tutorial rápido sobre como anotar imagens.\nPara prosseguir siga os passos para habilitar o botão \"Próximo\".\nPrimeiro, identifique o defeito na peça e clique na classe que você quer anotar, temos cinco classes disponiveis na aba inferior.",
	"Para anotar uma imagem, mova o mouse sobre ela, e quando o cursor estiver em formato de \"+\"\nbasta clicar e arrastar o mouse para desenhar uma caixa delimitadora.",
	"Após desenhar a caixa, você pode editar a anotação clicando em editar na aba da esquerda.\nEntão, poderá arrastar os pontos azuis que aparecem sobre a caixa para redimensiona-lá.\nSe quiser parar de editar clique em \"Editar\" novamente.",
	"Para excluir uma anotação, clique em excluir na aba da esquerda.",
	"Quando terminar, clique em \"Próxima\" na aba da direita para anotar a próxima imagem.\n<p>Se precisar, você também pode clicar em anterior para voltar e reanotar uma imagem.",
	"Quando terminar de anotar TODAS as imagens, clique em finalizar que vai estar no topo direito da tela. \nPronto para começar? Clique em \"Continuar\" também no topo direito para continuar o tutorial."
]

const slideshowClasses = ["rebarba", "rachadura", "perfuração", "não polida", "sem defeito"];
const slideshowImages = {
	"rebarba": ["img/tutorial/rebarba/rebarba0.jpg", "img/tutorial/rebarba/rebarba1.jpg", "img/tutorial/rebarba/rebarba2.jpg", "img/tutorial/rebarba/rebarba3.jpg", "img/tutorial/rebarba/rebarba4.jpg"],
	"rachadura": ["img/tutorial/rachadura/rachadura0.jpg", "img/tutorial/rachadura/rachadura1.jpg", "img/tutorial/rachadura/rachadura2.jpg", "img/tutorial/rachadura/rachadura3.jpg", "img/tutorial/rachadura/rachadura4.jpg"],	
	"perfuração": ["img/tutorial/perfuracao/perfuracao0.jpg", "img/tutorial/perfuracao/perfuracao1.jpg", "img/tutorial/perfuracao/perfuracao2.jpg", "img/tutorial/perfuracao/perfuracao3.jpg", "img/tutorial/perfuracao/perfuracao4.jpg"],	
	"não polida": ["img/tutorial/nao-polida/nao-polida0.jpg", "img/tutorial/nao-polida/nao-polida1.jpg", "img/tutorial/nao-polida/nao-polida2.jpg", "img/tutorial/nao-polida/nao-polida3.jpg", "img/tutorial/nao-polida/nao-polida4.jpg"],	
	"sem defeito": ["img/tutorial/sem-defeito/sem-defeito0.jpg", "img/tutorial/sem-defeito/sem-defeito1.jpg", "img/tutorial/sem-defeito/sem-defeito2.jpg", "img/tutorial/sem-defeito/sem-defeito3.jpg", "img/tutorial/sem-defeito/sem-defeito4.jpg"]	
}


var selectedClassTutorial = null;

var unlockedTutorialSteps = [0]
var currentTutorialScreen = 0;


var currentSlideshowClass = 0;
var currentSlideshowIndex = 0;


// Function switch to next tutorial flavor text
function nextTextTutorial() {
	if (currentTutorialScreen < tutorialTexts.length)
		currentTutorialScreen++;

	showTutorialText(currentTutorialScreen);

	//Disable next button if user has not unlocked the next screen
	if (!unlockedTutorialSteps.includes(currentTutorialScreen + 1)) {
		document.getElementById('next-tutorial-button').disabled = true;
	}

	if (currentTutorialScreen === tutorialTexts.length - 1) {
		//Disable next button if it is the last screen
		document.getElementById('next-tutorial-button').disabled = true;

		//Enable finish button of first part if it is the last screen
		let finishButton = document.getElementById('end-tutorial1-button');
		finishButton.disabled = false;
		finishButton.style.display = 'flex';

	}

	//Enable previous button if it is not the first screen
	if (currentTutorialScreen > 0) {
		document.getElementById('prev-tutorial-button').disabled = false;
	}


	if (currentTutorialScreen === 1) {

		annotationAreaTutorial.addEventListener('mousedown', startDrawingTutorial);
		annotationAreaTutorial.addEventListener('mousemove', drawRectangleTutorial);
		annotationAreaTutorial.addEventListener('mouseup', finishDrawingTutorial);

	}

	else if (currentTutorialScreen === 2) {
		annotationAreaTutorial.removeEventListener('mousedown', startDrawingTutorial);
		annotationAreaTutorial.removeEventListener('mousemove', drawRectangleTutorial);
		annotationAreaTutorial.removeEventListener('mouseup', finishDrawingTutorial);

		// show annotation list
		annotationListTutorial.childNodes.forEach(function (item) {
			//if item is a div
			if (item.nodeType === 1) {
				item.classList.remove("hidden");
			}
		});

	}

	else if (currentTutorialScreen === 4) {
		controlSectionTutorial.childNodes.forEach(function (item) {
			//if item is a div
			if (item.nodeType === 1) {
				item.style.display = 'flex';
			}
		});
	}

	createAnnotationCanvas("tutorial");

}

// Function switch to previous tutorial flavor text
function prevTextTutorial() {
	if (currentTutorialScreen > 0)
		currentTutorialScreen--;

	showTutorialText(currentTutorialScreen);

	//Disable previous button if it is the first screen
	if (currentTutorialScreen === 0) {
		document.getElementById('prev-tutorial-button').disabled = true;
	}

	//Enable next button if it is not the last screen
	if (currentTutorialScreen < tutorialTexts.length) {
		document.getElementById('next-tutorial-button').disabled = false;
	}

	createAnnotationCanvas("tutorial");
}



function displayTutorial() {
	// Switch to the tutorial screen
	switchScreen('tutorial-screen')

	// Display the first tutorial text
	showTutorialText(currentTutorialScreen);

	//disable next button
	document.getElementById('next-tutorial-button').disabled = true;

	createClassButtons("tutorial");
	createAnnotationCanvas("tutorial");

}


function showTutorialText(currentTutorialScreen) {
	tutorialDiv = document.getElementById('tutorial-text');
	centerDiv = document.createElement('div');
	centerDiv.classList.add('center');

	split_text = tutorialTexts[currentTutorialScreen].split("\n");
	split_text.forEach(function (text) {
		let p = document.createElement('p');
		p.innerHTML = text;
		centerDiv.appendChild(p);
	});
	tutorialDiv.innerHTML = "";
	tutorialDiv.appendChild(centerDiv);
}

function startDrawingTutorial(event) {

	if (selectedClassTutorial === null) {
		alert("Selecione uma classe antes de começar a desenhar");
		return;
	}

	if (rectangles.length > 3) {
		alert("Você atingiu o limite de anotações para este tutorial. Clique em próximo para continuar.");
		return;
	}

	if (isEditing) {
		return;
	}

	// annotationArea.requestPointerLock = annotationArea.requestPointerLock || annotationArea.mozRequestPointerLock;
	// annotationArea.requestPointerLock();

	isDrawing = true;
	startX = event.clientX - annotationAreaTutorial.getBoundingClientRect().left;
	startY = event.clientY - annotationAreaTutorial.getBoundingClientRect().top;

}

function drawRectangleTutorial(event) {
	if (!isDrawing) return;

	var x = event.clientX - annotationAreaTutorial.getBoundingClientRect().left;
	var y = event.clientY - annotationAreaTutorial.getBoundingClientRect().top;

	var width = Math.abs(x - startX);
	var height = Math.abs(y - startY);

	if (rectangle === undefined) {
		rectangle = document.createElement("div");
		rectangle.style.position = "absolute";
		rectangle.className = "rectangle";
		//random id
		rectangle.id = Math.random().toString(36).substring(3);

		switch (selectedClassTutorial) {
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
		annotationAreaTutorial.appendChild(rectangle);
		rectangles.push(rectangle);
	}

	// check bounds of the annotation area
	if (x < 0) {
		x = 0;
	} else if (x > annotationAreaTutorial.clientWidth) {
		x = annotationAreaTutorial.clientWidth;
		width = annotationAreaTutorial.clientWidth - startX;
	}

	if (y < 0) {
		y = 0;
	} else if (y > annotationAreaTutorial.clientHeight) {
		y = annotationAreaTutorial.clientHeight;
		height = annotationAreaTutorial.clientHeight - startY;
	}


	console.log(x, y, width, height)
	rectangle.style.left = Math.min(startX, x) + "px";
	rectangle.style.top = Math.min(startY, y) + "px";
	rectangle.style.width = width + "px";
	rectangle.style.height = height + "px";

}


function finishDrawingTutorial(event) {

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
		class: selectedClassTutorial,
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

	addAnnotationTutorial(imageFilename, annotation, rectangle.id);

	rectangle = undefined;

	if(currentTutorialScreen === 1) {
		document.getElementById("next-tutorial-button").disabled = false;
		unlockTutorialStep(2);
	}

}

function addAnnotationTutorial(imageId, annotation, rectangleId) {
	
	// count the number of annotations for this image of this class
	var count = 0;
	for (var i = 0; i < annotations[imageId].length; i++) {
		if (annotations[imageId][i].class === annotation.class) {
			count++;
		}
	}

	// create a new annotation list item

	var annotationItem = document.createElement("div");
	annotationItem.className = "annotation-list-item hidden";
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
			editAnnotationTutorial(annotation, rectangleId);

			// remove the class "ativo" from the other buttons
			document.querySelectorAll("#annotation-list-tutorial button").forEach(function(button) {
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
			var rects = annotationAreaTutorial.getElementsByClassName("rectangle");
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

		removeAnnotationTutorial(imageFilename, annotation, annotationItem, rectangleId);
	}

	buttons.appendChild(deleteButton);

	annotationItem.appendChild(buttons);

	annotationListTutorial.appendChild(annotationItem);

	annotCount++;
}


function chooseClassButtonTutorial() {
	var buttons = document.getElementById("class-buttons-tutorial").getElementsByTagName("button");
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].classList.remove("ativo");
	}
	this.classList.add("ativo");

	selectedClassTutorial = this.innerHTML;

	// fire an event to enable next tutorial screen button

	if(currentTutorialScreen === 0) {
		document.getElementById('next-tutorial-button').disabled = false;

		unlockTutorialStep(1);
	}

	// if (isEditing) {
	// 	stopEditing();
	// }
	// isEditing = false;

}

function unlockTutorialStep(step) {
	if (!unlockedTutorialSteps.includes(step)) {
		unlockedTutorialSteps.push(step);
	}
}


function stopEditingTutorial() {
	isEditing = false;

	// remove the class "ativo" from all buttons
	document.querySelectorAll("#annotation-list-tutorial button").forEach(function(button) {
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

function removeAnnotationTutorial(imageId, annotation, annotationItem, rectangleId) {

	if (annotations[imageId] === undefined) {
		return;
	}

	if (!unlockedTutorialSteps.includes(3)) {
		return;
	}

	var index = annotations[imageId].indexOf(annotation);
	if (index > -1) {
		annotations[imageId].splice(index, 1);
	}

	annotationListTutorial.removeChild(annotationItem);

	// remove the rectangle from the annotation area
	var rect = document.getElementById(rectangleId);
	annotationAreaTutorial.removeChild(rect);

	annotCount--;

	if(currentTutorialScreen === 3) {
		document.getElementById("next-tutorial-button").disabled = false;
		unlockTutorialStep(4);
	}

}


function editAnnotationTutorial(annotation, rectangleId) {

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
				newY = event.clientY - annotationAreaTutorial.getBoundingClientRect().top;

				//check if the new position is inside the annotation area
				if (newY < 0) {
					newY = 0;
				}

				if (newY + rectBounds.height > annotationAreaTutorial.clientHeight) {
					newY = annotationAreaTutorial.clientHeight - rectBounds.height;
				}
				
				// calculate the new height of the rectangle
				const deltaY = event.clientY - initialClientY;

				if (newY > 0 && rectBounds.height + newY < annotationAreaTutorial.clientHeight) {
					newHeight = initialHeight - deltaY;
				}
				
                break;
			case 'right':
				newWidth = event.clientX - rectBounds.left;

				if (newWidth + rectBounds.left > annotationAreaTutorial.getBoundingClientRect().right) {
					newWidth = annotationAreaTutorial.getBoundingClientRect().right - rectBounds.left - 1;
				}
				break;
			case 'bottom':
				newHeight = event.clientY - rectBounds.top;

				if (newHeight + rectBounds.top > annotationAreaTutorial.getBoundingClientRect().bottom) {
					newHeight = annotationAreaTutorial.getBoundingClientRect().bottom - rectBounds.top - 1;
				}
				break;
            case 'left':
				
				newX = event.clientX - annotationAreaTutorial.getBoundingClientRect().left;
				if (newX < 0) {
					newX = 0;
				}

				if (newX + rectBounds.width > annotationAreaTutorial.clientWidth) {
					newX = annotationAreaTutorial.clientWidth - rectBounds.width;
				}

				const deltaX = event.clientX - initialClientX;

				if (newX > 0 && rectBounds.width + newX < annotationAreaTutorial.clientWidth) {
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
        annotation.x_center = ( (rectBounds.left - annotationAreaTutorial.getBoundingClientRect().left ) + rectBounds.width / 2) / 500;
        annotation.y_center = ( (rectBounds.top - annotationAreaTutorial.getBoundingClientRect().top ) + rectBounds.height / 2) / 500;
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
            });
        });
    });

    // Update the position of anchors initially
    updateAnchors();

	if (currentTutorialScreen === 2) {
		document.getElementById("next-tutorial-button").disabled = false;
		unlockTutorialStep(3);
	}
}


function nextImageTutorial() {
	if (currentTutorialScreen === 4) {
		document.getElementById("next-tutorial-button").disabled = false;
		unlockTutorialStep(5);
	}

	showImageTutorial("img/tutorial/tutorial2.jpg");

	document.getElementById("image-counter-tutorial").innerHTML = "2/2";
}

function previousImageTutorial() {
	showImageTutorial("img/tutorial/tutorial1.jpg");

	document.getElementById("image-counter-tutorial").innerHTML = "1/2";
}

function showImageTutorial(path) {
	annotationImageTutorial.src = path
}


function nextClassSlideshow() {
	// show the next class in the slideshow

	currentSlideshowIndex = 0;
	currentSlideshowClass++;

	if (currentSlideshowClass === slideshowClasses.length) {
		document.getElementById('class-slideshow-tutorial').classList.add('hidden');
		document.getElementById('next-tutorial2-button').style.display = 'none';
		document.getElementById('tutorial-end').classList.remove('hidden');

		return;
	}
	className = slideshowClasses[currentSlideshowClass];
	imageList = Object.values(slideshowImages)[currentSlideshowClass];


	var imagehtml = document.getElementsByClassName("slideshow-image")[0];
	imagehtml.src = imageList[currentSlideshowIndex];

	document.getElementById('next-tutorial2-button').style.display = 'none';

	document.getElementById('prev-image-slideshow-button').disabled = true;

	document.getElementById('next-image-slideshow-button').disabled = false;

	document.getElementById('slideshow-image-counter').innerHTML = (currentSlideshowIndex + 1) + "/" + imageList.length.toString();

	document.getElementById('class-slideshow-name').innerHTML = className;
	document.getElementById('class-slideshow-description').innerHTML = "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
}
function nextImageSlideshow() {
	// show the next image in the slideshow
	currentSlideshowIndex++;

	imageList = Object.values(slideshowImages)[currentSlideshowClass];

	if (currentSlideshowIndex === imageList.length - 1) {
		document.getElementById('next-image-slideshow-button').disabled = true;

		document.getElementById('next-tutorial2-button').addEventListener('click', nextClassSlideshow);

		document.getElementById('next-tutorial2-button').style.display = 'flex';
	}
	var imagehtml = document.getElementsByClassName("slideshow-image")[0];

	imagehtml.src = imageList[currentSlideshowIndex];

	document.getElementById('prev-image-slideshow-button').disabled = false;

	document.getElementById('slideshow-image-counter').innerHTML = (currentSlideshowIndex + 1) + "/" + imageList.length.toString();

}

function previousImageSlideshow() {
	// show the previous image in the slideshow
	currentSlideshowIndex--;

	imageList = Object.values(slideshowImages)[currentSlideshowClass];

	if (currentSlideshowIndex === 0) {
		document.getElementById('prev-image-slideshow-button').disabled = true;
	}
	var imagehtml = document.getElementsByClassName("slideshow-image")[0];
	imagehtml.src = imageList[currentSlideshowIndex];

	document.getElementById('next-image-slideshow-button').disabled = false;

	document.getElementById('slideshow-image-counter').innerHTML = (currentSlideshowIndex + 1) + "/" + imageList.length.toString();
}

// Add event listener to the tutorial subscreen button
document.getElementById('next-tutorial-button').addEventListener('click', function() {
	nextTextTutorial();
});

//Add event listener to the tutorial subscreen button
document.getElementById('prev-tutorial-button').addEventListener('click', function() {
	prevTextTutorial();
});

nextImageTutorialButton.addEventListener("click", nextImageTutorial);
previousImageTutorialButton.addEventListener("click", previousImageTutorial);

document.getElementById('start-test-button').addEventListener('click', function() {
	initializeTest();
})

document.getElementById('end-tutorial1-button').addEventListener('click', function() {
	// display the second part of the tutorial
	document.getElementById('annotation-container-tutorial').style.display = 'none';
	document.getElementById('class-buttons-tutorial').parentElement.style.display = 'none';
	document.getElementById('tutorial-text').style.display = "none";
	document.getElementById('tutorial-text-control').style.display = 'none';

	document.getElementById('class-slideshow-tutorial').classList.remove('hidden');

	document.getElementById('next-image-slideshow-button').addEventListener('click',nextImageSlideshow);

	document.getElementById('prev-image-slideshow-button').addEventListener('click', previousImageSlideshow);

	document.getElementById('prev-image-slideshow-button').disabled = true;

	this.style.display = 'none';



});