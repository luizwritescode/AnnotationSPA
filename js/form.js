function validateFormFields() {

		// Error handling
		const requiredFields = ['nome', 'idade','genero','escolaridade']
		for (let i = 0; i < requiredFields.length; i++) {
			const field = requiredFields[i];
			if (!document.getElementById(field).value) {
				alert('Por favor, preencha o campo ' + field);
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

		// Send the data to the server
		console.log(data);	// Log the data to the console

		displayTutorial();

	}
