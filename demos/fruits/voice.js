var mensaje = document.getElementById('mensaje'),
	microfono = document.getElementById('microfono'),
	loading = document.getElementById('loading'),
	transcript = '',
	resultado = document.getElementById('resultado'),
	pensando = document.getElementById('pensando'),
	recognizing = false,
	recognized_atleastonetry = false,
	timeout


if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window) && !('mozSpeechRecognition' in window) && !('msSpeechRecognition' in window)) {
	alert('Sorry, no es compatible con tu navegador. Si quieres continuar puedes actualizar a la última versión de Chrome. En iPhone / iPad no funciona :( puedes comprarte un Android ;)');
	mensaje.innerHTML = 'Sorry, tu dispositivo no es compatible :(';
} else {
	var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
	recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = function() {
		//escuchando
		console.log('Escuchando');
		recognizing = true;
		mensaje.innerHTML = 'Te estoy escuchando!<br/><b>Di el nombre</b> de una fruta.';
		microfono.className += ' activo';
		resultado.classList.remove('activo');
	}
	recognition.onresult = function(event) {
		var interim_transcript = '';
		var final_transcript = false;
		recognized_atleastonetry = true;
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
		else if(transcript.match(/limón/i) || transcript.match(/lima/i)) hay_match('limon');
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
		recognizing = false;
		console.log('Error: '+event.error);
	}
	recognition.onend = function() {
		//no escuchando
		if(!recognized_atleastonetry) recognition.start();//un intento más
		recognizing = false;
		recognized_atleastonetry = true;
		console.log('Fin');
		
		mensaje.innerHTML = 'Muy bien.<br/>¿Quieres <a onclick="escuchar(); return false;"><u>volver a empezar</u></a>?';
		microfono.classList.remove('activo');
	}
}

function hay_match (id) {
	transcript = '';
	//resultado.classList.remove('activo');
	console.log('mostrar: '+id);
	resultado.src = 'multimedia/'+id+'.png';
	resultado.className += ' activo';
	window.clearTimeout(timeout);
	timeout = setTimeout(function () {
		resultado.classList.remove('activo');
	}, 2500);
}

function escuchar () {
	if(recognizing) {
		//recognition.stop();
		return;
	}
	loading.style.display = 'none';
	microfono.style.display = 'inline';
	recognition.lang = 'es_ES';
	recognition.start();
}