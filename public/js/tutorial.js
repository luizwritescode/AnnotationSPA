

const imageContainerTutorial = document.getElementById('image-container-tutorial');
const annotationAreaTutorial = document.getElementById("annotation-area-tutorial");
const annotationListTutorial = document.getElementById("annotation-list-tutorial");
const annotationImageTutorial = document.getElementById("annotation-image-tutorial");
const controlSectionTutorial = document.getElementById("control-section-tutorial");

const nextImageTutorialButton = document.getElementById("next-image-button-tutorial");
const previousImageTutorialButton = document.getElementById("previous-image-button-tutorial");

const tutorialTexts = [
	"Antes de começar, vamos passar por um tutorial rápido sobre como utilizar este aplicativo. Para prosseguir, siga os passos para habilitar o botão \"Próximo\". Primeiro, <span class='important-text'>clique no botão com a classe \'gato\'</span>. Lembre sempre de selecionar a classe ANTES de fazer a anotação.",
	"Para anotar uma imagem, mova o mouse sobre ela, e quando o cursor estiver em formato de \"+\", basta clicar e arrastar o mouse para desenhar uma caixa delimitadora. <span class='important-text'>Desenhe uma caixa ao redor do gato na imagem abaixo.</span> Não se preocupe com a precisão, você poderá editar a caixa depois.",
	"Após desenhar a caixa, irá surgir uma lista na aba da esquerda com as anotações já feitas. Aqui poderá escolher editar ou excluir a caixa. <span class='important-text'>Clique em 'Editar' para ativar o modo de edição para aquela caixa</span>. Neste modo poderá arrastar os pontos azuis que aparecem sobre a caixa para redimensiona-lá. As edições são salvas automaticamente.",
	"Para excluir uma anotação, <span class='important-text'>clique em excluir na aba da esquerda. </span> Lembre-se que ao excluir uma anotação, ela não poderá ser recuperada.",
	"A aba da direita mostra quantas imagens faltam. <span class='important-text'>Clique em \"Próxima\" na aba da direita para anotar a próxima imagem</span>. Se precisar, você também pode clicar em anterior para voltar e reanotar uma imagem.",
	"Quando terminar de anotar TODAS as imagens, clique em \"Finalizar\" que vai estar no topo direito da tela. \nAgora você pode continuar o tutorial <span class='important-text'>clicando em \"Continuar\" também no topo direito da tela</span>."
]

const slideshowClasses = ["sem defeito", "não polida", "rebarba", "rachadura", "perfuração"];
const slideshowImages = {
	"sem defeito": ["img/tutorial/sem_defeito/sem_defeito0.jpg", "img/tutorial/sem_defeito/sem_defeito1.jpg", "img/tutorial/sem_defeito/sem_defeito2.jpg", "img/tutorial/sem_defeito/sem_defeito3.jpg", "img/tutorial/sem_defeito/sem_defeito4.jpg"],
	"não polida": ["img/tutorial/nao_polida/nao_polida0.jpg", "img/tutorial/nao_polida/nao_polida1.jpg", "img/tutorial/nao_polida/nao_polida2.jpg", "img/tutorial/nao_polida/nao_polida3.jpg", "img/tutorial/nao_polida/nao_polida4.jpg"],
	"rebarba": ["img/tutorial/rebarba/rebarba0.jpg", "img/tutorial/rebarba/rebarba1.jpg", "img/tutorial/rebarba/rebarba2.jpg", "img/tutorial/rebarba/rebarba3.jpg", "img/tutorial/rebarba/rebarba4.jpg"],
	"rachadura": ["img/tutorial/rachadura/rachadura0.jpg", "img/tutorial/rachadura/rachadura1.jpg", "img/tutorial/rachadura/rachadura2.jpg", "img/tutorial/rachadura/rachadura3.jpg", "img/tutorial/rachadura/rachadura4.jpg"],
	"perfuração": ["img/tutorial/perfuracao/perfuracao0.jpg", "img/tutorial/perfuracao/perfuracao1.jpg", "img/tutorial/perfuracao/perfuracao2.jpg", "img/tutorial/perfuracao/perfuracao3.jpg", "img/tutorial/perfuracao/perfuracao4.jpg"],
}

const slideshowClassDescriptions = {
	"sem defeito": "Uma peça categorizada como \"Sem defeito\" apresenta uma superfície sem imperfeições. A superfície sem defeito é lisa e uniforme. A anotação para este defeito é feita delimitando a peça INTEIRA dentro da caixa. Cada peça só pode ter no máximo uma anotação Sem defeito.",
	"não polida": "Uma superfície não polida apresenta irregularidades e asperezas indicando que a peça não foi submetida a um processo de polimento. A anotação para este defeito é feita delimitando a peça <span class='important-text'>INTEIRA</span> dentro da caixa. Cada peça só pode ter no máximo uma anotação \"Não polida\".",
	"rebarba": "Rebarba é um defeito onde se encontra excesso de material fundido nas bordas da peça. A anotação para este defeito é feita delimitando a peça <span class='important-text'>INTEIRA</span> dentro da caixa. Cada peça só pode ter no máximo uma anotação \"Rebarba\".",
	"rachadura": "Rachadura é uma fratura que ocorre em um material sólido. Procure por indicativos de tensões internas, fadiga ou impacto. A anotação para este defeito é feita delimitando <span class='important-text'>SOMENTE</span> o defeito dentro da caixa. Cada peça pode ter mais de uma anotação \"Rachadura\".",
	"perfuração": "Perfuração indica que há furos em uma peça. Em geral, a principal diferença da natureza deste com outros defeitos é a profundidade que alcança na peça. A anotação para este defeito é feita delimitando <span class='important-text'>SOMENTE</span> o defeito dentro da caixa. Cada peça pode ter mais de uma anotação \"Perfuração\".",
}

var selectedClassTutorial = null;

var unlockedTutorialSteps = [0]
var currentTutorialScreen = 0;


var currentSlideshowClass = 0;
var currentSlideshowIndex = 0;


// Function switch to next tutorial flavor text
// it also enables/disables the next button if the user has unlocked the next screen
function nextTextTutorial() {
	if (currentTutorialScreen < tutorialTexts.length)
		currentTutorialScreen++;

	showTutorialText(currentTutorialScreen);

	//Disable next button if user has not unlocked the next screen
	debugger
	if (!unlockedTutorialSteps.includes(currentTutorialScreen + 1)) {
		document.getElementById('next-tutorial-button').disabled = true;
	} else {
		showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);
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

		if (!unlockedTutorialSteps.includes(2)) {

			showAssistiveBox();
			// hide tutorial arrow
			document.getElementById('tutorial-arrow').style.display = 'none';
		}


	}

	else if (currentTutorialScreen === 2) {
		annotationAreaTutorial.removeEventListener('mousedown', startDrawingTutorial);
		annotationAreaTutorial.removeEventListener('mousemove', drawRectangleTutorial);
		annotationAreaTutorial.removeEventListener('mouseup', finishDrawingTutorial);

		let assistiveCursor = document.getElementsByClassName('assistive-cursor')[0]
		if (assistiveCursor !== undefined) {	assistiveCursor.remove(); }


		// show annotation list
		annotationListTutorial.childNodes.forEach(function (item) {
			//if item is a div
			if (item.nodeType === 1) {
				item.classList.remove("hidden");
			}
		});

		if (unlockedTutorialSteps.includes(3)) {
			showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);
		} else {
			showTutorialArrow(document.getElementById('annotation-list-tutorial').getElementsByTagName('button')[0], "top");
		}
	}
	else if (currentTutorialScreen === 3) {
		stopEditingTutorial();

		if (unlockedTutorialSteps.includes(4)) {
			showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);
		} else {
			showTutorialArrow(document.getElementById('annotation-list-tutorial').getElementsByTagName('button')[1], "top");
		}
	}
	else if (currentTutorialScreen === 4) {
		
		controlSectionTutorial.childNodes.forEach(function (item) {
			//if item is a div
			if (item.nodeType === 1) {
				item.style.display = 'flex';
			}
		});

		if (unlockedTutorialSteps.includes(5)) {
			showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);
		} else {
			showTutorialArrow(controlSectionTutorial.getElementsByTagName('button')[1], "top");
		}
	}

	else if (currentTutorialScreen === 5) {

		showTutorialArrow(document.getElementById('end-tutorial1-button'));
	}

	createAnnotationCanvas("tutorial");

}

// Function switch to previous tutorial flavor text
function prevTextTutorial() {
	debugger
	console.log(currentTutorialScreen)
	if (currentTutorialScreen > 0)
		currentTutorialScreen--;

	stopEditingTutorial();

	showTutorialText(currentTutorialScreen);

	// show arrow pointing to the next button if it is unlocked
	if (unlockedTutorialSteps.includes(currentTutorialScreen + 1)) {
		showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);
	}

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

	// Set src of the first tutorial image
	showImageTutorial("img/tutorial/friends.png");


	//disable next button
	document.getElementById('next-tutorial-button').disabled = true;

	createClassButtonsTutorial();
	createAnnotationCanvas("tutorial");

	showTutorialArrow(document.getElementById('class-buttons-tutorial').getElementsByTagName('button')[0]);
}


function showTutorialText(currentTutorialScreen) {
	tutorialDiv = document.getElementById('tutorial-text');
	centerDiv = document.createElement('div');
	bgDiv = document.createElement('div');
	centerDiv.style.display = 'flex';
	centerDiv.style.justifyContent = 'center';
	centerDiv.style.alignItems = 'center';
	centerDiv.style.width = '100%'
	bgDiv.style.maxWidth = '768px';
	bgDiv.style.textAlign = 'center';
	bgDiv.style.padding = '15px';
	bgDiv.style.backgroundColor = 'rgba(64, 64, 64, 1)';
	bgDiv.style.borderRadius = '10px';

	let maxWidth = 0;
	split_text = tutorialTexts[currentTutorialScreen].split("\n");
	split_text.forEach(function (text) {
		let p = document.createElement('p');
		p.innerHTML = text;
		bgDiv.appendChild(p);
	});

	tutorialDiv.innerHTML = "";
	centerDiv.appendChild(bgDiv);
	tutorialDiv.appendChild(centerDiv);
}

function showTutorialArrow(element, position = "left") {

	let tutorialArrow = document.getElementById('tutorial-arrow')


	let x = element.offsetLeft;
	let y = element.offsetTop;

	if (position === "left") {
		tutorialArrow.innerHTML = "&rarr;"
		x -= 70;
		y -= 30;

		//position to the left of the element
		tutorialArrow.classList.remove('bouncingY')
		tutorialArrow.classList.add('bouncingX')

	} else if (position === "top") {
		tutorialArrow.innerHTML = "&darr;"
		x += 15;
		y -= 90;
		tutorialArrow.classList.remove('bouncingX')
		tutorialArrow.classList.add('bouncingY')
	}

	tutorialArrow.style.left = x + 'px';
	tutorialArrow.style.top = y + 'px';
	tutorialArrow.style.display = 'block';
	tutorialArrow.style.position = 'absolute';
}

function showAssistiveBox() {

	let assistiveBox = document.createElement('div');
	assistiveBox.className = "assistive-box";
	assistiveBox.style.position = "absolute";
	assistiveBox.style.top = "59px";
	assistiveBox.style.left = "300px";
	assistiveBox.style.width = "71px";
	assistiveBox.style.height = "184px";
	assistiveBox.style.border = "2px dashed orange";

	let assistiveCursor = document.createElement("img");
	assistiveCursor.className = "assistive-cursor sliding-animation";
	assistiveCursor.style.position = "absolute";
	assistiveCursor.style.top = 59 + "px";
	assistiveCursor.style.left = 300 - 5 + "px";
	assistiveCursor.style.width = "25px";
	assistiveCursor.style.height = "40px";
	assistiveCursor.src = "./img/tutorial/hand-cursor.png";

	annotationAreaTutorial.appendChild(assistiveBox);
	annotationAreaTutorial.appendChild(assistiveCursor);

}

function startDrawingTutorial(event) {

	if (selectedClassTutorial === null) {
		alert("Selecione uma classe antes de começar a desenhar");
		return;
	}

	if (rectangles.length > 0) {
		alert("Clique em próximo para continuar.");
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
			case "gato":
				rectangle.classList.add("red-border");
				break;
			case "cachorro":
				rectangle.classList.add("blue-border");
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

	var endX = event.clientX - annotationAreaTutorial.getBoundingClientRect().left;
	var endY = event.clientY - annotationAreaTutorial.getBoundingClientRect().top;

	var width = Math.abs(event.clientX - annotationAreaTutorial.getBoundingClientRect().left - startX);
	var height = Math.abs(event.clientY - annotationAreaTutorial.getBoundingClientRect().top - startY);


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
	var image = document.getElementById("annotation-image-tutorial");
	var imageFilename = image.src.split("/").pop();

	if (annotations[imageFilename] === undefined) {
		annotations[imageFilename] = [];
	}

	if (annotation.width === 0 || annotation.height === 0) {
		console.log("Tentou criar anotação com largura ou altura 0, não salva a anotação")
		return
	}


	annotations[imageFilename].push(annotation);


	if (annotation.width < 0.03 || annotation.height < 0.03) {
		alert("A caixa desenhada foi muito pequena, tente novamente.");
		var index = annotations[imageFilename].indexOf(annotation);
		if (index > -1) {
			annotations[imageFilename].splice(index, 1);
		}

		//annotationListTutorial.removeChild(annotationListTutorial.lastChild);

		// remove the rectangle from the annotation area
		annotationAreaTutorial.removeChild(rectangle);
		rectangles = []
		rectangle = undefined;
		return;
	}
	console.log(annotations)
	addAnnotationTutorial(imageFilename, annotation, rectangle.id);
	rectangle = undefined;

	if (currentTutorialScreen === 1) {
		document.getElementById("next-tutorial-button").disabled = false;
		unlockTutorialStep(2);

		let assistiveCursor = document.getElementsByClassName('assistive-cursor')[0];
		if (assistiveCursor !== undefined) {
			assistiveCursor.remove();
		}

		showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);
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

	editButton.onclick = function () {

		annotation.isEditing = !annotation.isEditing;

		if (annotation.isEditing) {
			editButton.classList.add("ativo");
			editAnnotationTutorial(annotation, rectangleId);

			// remove the class "ativo" from the other buttons
			document.querySelectorAll("#annotation-list-tutorial button").forEach(function (button) {
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
		var image = document.getElementById("annotation-image-tutorial");
		var imageFilename = image.src.split("/").pop();
		debugger
		if (unlockedTutorialSteps.includes(3))
			removeAnnotationTutorial(imageFilename, annotation, annotationItem, rectangleId);
	}

	buttons.appendChild(deleteButton);

	annotationItem.appendChild(buttons);

	annotationListTutorial.appendChild(annotationItem);

	annotCount++;
}

function createClassButtonsTutorial() {

	let classColors = {
		"gato": "red",
		"cachorro": "blue",
	};

	let classes = ["gato", "cachorro"];
	let targetId = "class-buttons-tutorial";
	let classButtons = document.getElementById(targetId);
	for (var i = 0; i < classes.length; i++) {
		var button = document.createElement("button");
		button.innerHTML = classes[i];
		button.className = "btn " + classColors[classes[i]] + "-border " + "btn-large";
		button.onclick = chooseClassButtonTutorial;

		classButtons.appendChild(button);
	}
}

function chooseClassButtonTutorial() {
	var buttons = document.getElementById("class-buttons-tutorial").getElementsByTagName("button");

	selectedClassTutorial = this.innerHTML;

	if (selectedClassTutorial !== "gato") {
		return;
	}

	for (var i = 0; i < buttons.length; i++) {
		buttons[i].classList.remove("ativo");
	}
	this.classList.add("ativo");


	// fire an event to enable next tutorial screen button

	if (currentTutorialScreen === 0) {
		document.getElementById('next-tutorial-button').disabled = false;

		unlockTutorialStep(1);

		showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);
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
	document.querySelectorAll("#annotation-list-tutorial button").forEach(function (button) {
		button.classList.remove("ativo");
	});

	// remove isEditing from all annotations
	// for (var i = 0; i < annotations[currentImageId].length; i++) {
	// 	annotations[currentImageId][i].isEditing = false;
	// }


	// remove anchors from all rectangles
	var rects = annotationAreaTutorial.getElementsByClassName("rectangle");
	Array.prototype.slice.call(rects).forEach(function (rect) {

		var anchors = rect.getElementsByClassName("anchor");
		Array.prototype.slice.call(anchors).forEach(function (anchor) {
			rect.removeChild(anchor);
		});
	});

}

function removeAnnotationTutorial(imageId, annotation, annotationItem, rectangleId) {
	debugger
	if (annotations[imageId] === undefined) {
		return;
	}

	if (!unlockedTutorialSteps.includes(3) && currentTutorialScreen === 3) {
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

	if (currentTutorialScreen === 3) {
		document.getElementById("next-tutorial-button").disabled = false;
		unlockTutorialStep(4);

		showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);
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
		annotation.x_center = ((rectBounds.left - annotationAreaTutorial.getBoundingClientRect().left) + rectBounds.width / 2) / 500;
		annotation.y_center = ((rectBounds.top - annotationAreaTutorial.getBoundingClientRect().top) + rectBounds.height / 2) / 500;
		annotation.width = rectBounds.width / 500;
		annotation.height = rectBounds.height / 500;

		if (annotation.width > 1.0) {
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



		showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);

	}
}


function nextImageTutorial() {
	if (currentTutorialScreen === 4) {
		document.getElementById("next-tutorial-button").disabled = false;
		unlockTutorialStep(5);
		showTutorialArrow(document.getElementById('tutorial-text-control').getElementsByTagName('button')[1]);
		let assistiveBox = document.getElementsByClassName('assistive-box')[0];
		if (assistiveBox !== undefined) {
			assistiveBox.remove();
		}
	}

	showImageTutorial("./img/tutorial/friends5.png");

	document.getElementById("image-counter-tutorial").innerHTML = "2/2";
}

function previousImageTutorial() {
	showImageTutorial("img/tutorial/friends.png");

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
		document.getElementById('next-tutorial2-button').classList.add('hidden');
		document.getElementById('back-button').classList.add('hidden');
		document.getElementById('tutorial-end').classList.remove('hidden');

		return;
	}
	
	let className = slideshowClasses[currentSlideshowClass];
	let description = Object.values(slideshowClassDescriptions)[currentSlideshowClass];
	let imageList = Object.values(slideshowImages)[currentSlideshowClass];


	var imagehtml = document.getElementsByClassName("slideshow-image")[0];
	imagehtml.src = imageList[currentSlideshowIndex];

	document.getElementById('next-tutorial2-button').disabled = true;

	document.getElementById('prev-image-slideshow-button').disabled = true;

	document.getElementById('next-image-slideshow-button').disabled = false;

	document.getElementById('slideshow-image-counter').innerHTML = (currentSlideshowIndex + 1) + "/" + imageList.length.toString();

	document.getElementById('class-slideshow-name').innerHTML = className.charAt(0).toUpperCase() + className.slice(1);

	document.getElementById('class-slideshow-description').innerHTML = description;

	document.getElementById('back-button').disabled = false;
}

function previousClassSlideshow() {
	// show the previous class in the slideshow
	currentSlideshowIndex = 0;
	currentSlideshowClass--;

	if (currentSlideshowClass === 0) {
		document.getElementById('prev-image-slideshow-button').disabled = true;
		document.getElementById('back-button').disabled = true;
	}

	let className = slideshowClasses[currentSlideshowClass];
	let description = Object.values(slideshowClassDescriptions)[currentSlideshowClass];
	let imageList = Object.values(slideshowImages)[currentSlideshowClass];

	var imagehtml = document.getElementsByClassName("slideshow-image")[0];
	imagehtml.src = imageList[currentSlideshowIndex];

	document.getElementById('next-image-slideshow-button').disabled = false;

	document.getElementById('slideshow-image-counter').innerHTML = (currentSlideshowIndex + 1) + "/" + imageList.length.toString();

	document.getElementById('class-slideshow-name').innerHTML = className.charAt(0).toUpperCase() + className.slice(1);
	document.getElementById('class-slideshow-description').innerHTML = description;
}


function nextImageSlideshow() {
	// show the next image in the slideshow
	currentSlideshowIndex++;

	imageList = Object.values(slideshowImages)[currentSlideshowClass];

	if (currentSlideshowIndex === imageList.length - 1) {
		document.getElementById('next-image-slideshow-button').disabled = true;

		document.getElementById('next-tutorial2-button').addEventListener('click', nextClassSlideshow);

		document.getElementById('next-tutorial2-button').disabled = false;

	}
	var imagehtml = document.getElementsByClassName("slideshow-image")[0];

	// just reuse the same image element as the preloaded images are already in the browser cache
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
document.getElementById('next-tutorial-button').addEventListener('click', function () {
	nextTextTutorial();
});

//Add event listener to the tutorial subscreen button
document.getElementById('prev-tutorial-button').addEventListener('click', function () {
	prevTextTutorial();
});

nextImageTutorialButton.addEventListener("click", nextImageTutorial);
previousImageTutorialButton.addEventListener("click", previousImageTutorial);

document.getElementById('start-training-button').addEventListener('click', function () {
	initializeTraining();
})

document.getElementById('start-tutorial2-button').addEventListener('click', function () {
	document.getElementById('tutorial1-end').classList.add('hidden');
	document.getElementById('class-slideshow-tutorial').classList.remove('hidden');
	document.getElementById('next-tutorial2-button').classList.remove('hidden');
	document.getElementById('next-tutorial2-button').addEventListener('click', nextClassSlideshow);
	document.getElementById('prev-image-slideshow-button').addEventListener('click', previousImageSlideshow);
	document.getElementById('next-image-slideshow-button').addEventListener('click', nextImageSlideshow);

	document.getElementById('prev-image-slideshow-button').disabled = true;

	document.getElementById('back-button').classList.remove('hidden');
	document.getElementById('back-button').disabled = true

	document.getElementById('back-button').addEventListener('click', previousClassSlideshow);
	

	this.style.display = 'none';
});



document.getElementById('end-tutorial1-button').addEventListener('click', function () {
	// hide first tutorial screen
	document.getElementById('annotation-container-tutorial').style.display = 'none';
	document.getElementById('class-buttons-tutorial').parentElement.style.display = 'none';
	document.getElementById('tutorial-text').style.display = "none";
	document.getElementById('tutorial-text-control').style.display = 'none';
	this.style.display = 'none';
	document.getElementById('tutorial-arrow').style.display = 'none';
	
	
	// show instructions for the second tutorial
	document.getElementById('tutorial1-end').classList.remove('hidden');



});