var mensaje = document.getElementById('mensaje'),
	microfono = document.getElementById('microfono'),
	transcript = '',
	frutas = document.getElementsByClassName("fruta"),
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
		mensaje.innerHTML = 'Te estoy escuchando!';
		microfono.className += " pulse";
	}
	recognition.onresult = function(event) {
		var interim_transcript = '';
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				transcript += event.results[i][0].transcript;
			} else {
				interim_transcript += event.results[i][0].transcript;
			}
		}
		if(final_transcript) {
			frutas.forEach(function(element) {
				element.remove("activa");
			});
			
			console.log(transcript);
			if(transcript.match(/aguacate/i)) document.getElementById('aguacate').className += " activa";
			else if(transcript.match(/cereza/i)) document.getElementById('cerezas').className += " activa";
			else if(transcript.match(/coco/i)) document.getElementById('coco').className += " activa";
			else if(transcript.match(/fresa/i)) document.getElementById('fresa').className += " activa";
			else if(transcript.match(/kiwi/i)) document.getElementById('kiwi').className += " activa";
			else if(transcript.match(/limon/i)) document.getElementById('limon').className += " activa";
			else if(transcript.match(/manzana/i)) document.getElementById('manzana').className += " activa";
			else if(transcript.match(/naranja/i)) document.getElementById('naranja').className += " activa";
			else if(transcript.match(/pera/i)) document.getElementById('pera').className += " activa";
			else if(transcript.match(/piña/i)) document.getElementById('pina').className += " activa";
			else if(transcript.match(/sandia/i)) document.getElementById('sandia').className += " activa";
			else if(transcript.match(/uva/i)) document.getElementById('uvas').className += " activa";
			else document.getElementById('pensando').style.visibility = "visible";
		} else {
			console.log(transcript);
		}
	}
	recognition.onerror = function(event) {
		console.log('Error: '+event.error);
	}
	recognition.onend = function() {
		//no escuchando
		console.log('Fin');
		recognizing = false;
		mensaje.innerHTML = 'Puedes decir el nombre de la fruta que te apecete delante de tu micro.';
		microfono.classList.remove("pulse");
	}
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