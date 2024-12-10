
function validateFormFields() {

		const submitButton = document.getElementById('submit-candidate-form-button')

		// Error handling
		const requiredFields = ['nome', 'idade','genero','escolaridade']
		for (let i = 0; i < requiredFields.length; i++) {
			const field = requiredFields[i];
			if (!document.getElementById(field).value) {
				modalAlert('Por favor, preencha o campo ' + field);
				setTimeout(function() {
					document.documentElement.requestFullscreen();
				})
				return;
			}

			if (field === 'idade' && document.getElementById(field).value < 1 || document.getElementById(field).value > 100) {
				modalAlert('Por favor, preencha o campo ' + field + ' com um valor válido');
				setTimeout(function() {
					document.documentElement.requestFullscreen();
				})
				return;
			}
		}

		

		// Get the form data
		const form = document.getElementById('candidate-form');
		const formData = new FormData(form);
		const data = {};
		formData.forEach((value, key) => {
			data[key] = value;
		});

		//store a copy in localStorage
		localStorage.setItem('user', JSON.stringify(data))

		currentUser = data

		console.log(currentUser)

		//Send the data to the database
		db.collection('candidates').add(data)
			.then(function(docRef) {
				console.log('Document written with ID: ', docRef.id);
				//store the candidate id in local storage
				candidateId = docRef.id;
				localStorage.setItem('candidateId', candidateId);
				displayTutorial();
			})
			.catch(function(error) {
				console.error('Error adding document: ', error);
				alert('Erro ao enviar dados. Por favor, notifique a pessoa instrutora.');
			});

		//displayTutorial();
		
		// Add spinner to the button
		submitButton.innerHTML = '<div class="spinner"></div>'

		// Disable the button
		submitButton.disabled = true;

	}