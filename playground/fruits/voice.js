var mensaje = document.getElementById('mensaje'),
	microfono = document.getElementById('microfono'),
	transcript = '',
	final_transcript = false,
	frutas = document.getElementsByClassName("fruta"),
	pensando = document.getElementById('pensando'),
	recognizing = false

if (!('webkitSpeechRecognition' in window)) {
	alert('Sorry, no es compatible con tu navegador. Si quieres continuar puedes actualizar a la última versión de Chrome');
} else {
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = function() {
		//escuchando
		console.log('Escuchando');
		recognizing = true;
		mensaje.innerHTML = 'Te estoy escuchando! Puedes decir el nombre de una fruta.';
		microfono.className += " pulse";
	}
	recognition.onresult = function(event) {
		var interim_transcript = '';
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				transcript += event.results[i][0].transcript;
				final_transcript = true;
			} else {
				transcript += event.results[i][0].transcript;
			}
		}
		
		console.log('transcript: '+transcript);
		if(final_transcript) console.log('final_transcript: '+transcript);
		
		if(transcript.match(/aguacate/i)) hay_match('aguacate');
		else if(transcript.match(/cereza/i)) hay_match('cerezas');
		else if(transcript.match(/coco/i)) hay_match('coco');
		else if(transcript.match(/kiwi/i)) hay_match('kiwi');
		else if(transcript.match(/limón/i)) hay_match('limon');
		else if(transcript.match(/manzana/i)) hay_match('manzana');
		else if(transcript.match(/naranja/i) || transcript.match(/mandarina/i)) hay_match('naranja');
		else if(transcript.match(/plátano/i) || transcript.match(/banana/i)) hay_match('platano');
		else if(transcript.match(/pera/i) || transcript.match(/pere/i)) hay_match('pera');
		else if(transcript.match(/piña/i)) hay_match('pina');
		else if(transcript.match(/sandía/i)) hay_match('sandia');
		else if(transcript.match(/uva/i)) hay_match('uvas');
		else if(transcript.match(/caca/i) || transcript.match(/mierda/i) || transcript.match(/culo/i)) hay_match('caca');
		else if(final_transcript) hay_match('pensando');//no hay match		
	}
	recognition.onerror = function(event) {
		console.log('Error: '+event.error);
	}
	recognition.onend = function() {
		//no escuchando
		console.log('Fin');
		recognizing = false;
		mensaje.innerHTML = 'Ya hemos jugado. ¿Quieres volver a empezar? Recarga la página.';
		microfono.classList.remove("pulse");
	}
}

function hay_match (id) {
	transcript = '';
	for (var i = 0; i < frutas.length; i++) {
		frutas[i].classList.remove("activa");			
	}
	document.getElementById(id).className += " activa";
}

function escuchar () {
	if(recognizing) {
		recognition.stop();
		return;
	}
	final_transcript = '';
	recognition.lang = 'es_ES';
	recognition.start();
}