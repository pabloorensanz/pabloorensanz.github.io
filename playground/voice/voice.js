var transcript = 
	final_transcript = '',
	recognizing = false,
	start_timestamp

if (!('webkitSpeechRecognition' in window)) {
	alert('Sorry, no es compatible con tu navegador. Si quieres continuar puedes actualizar a la última versión de Chrome');
} else {
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = function() {
		recognizing = true;
	}
	recognition.onresult = function(event) {
		var interim_transcript = '';
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				final_transcript += event.results[i][0].transcript;
			} else {
				interim_transcript += event.results[i][0].transcript;
			}
		}
		if(final_transcript) transcript.innerHTML = capitalize(final_transcript);
		else transcript.innerHTML = interim_transcript;
	}
	recognition.onerror = function(event) {
		alert('Error: '+event.error);
	}
	recognition.onend = function() {
		recognizing = false;
	}
}

function run () {
	if(recognizing) {
		recognition.stop();
		return;
	}
	final_transcript = '';
	recognition.lang = 'es_ES';
	recognition.start();
	start_timestamp = event.timeStamp;
}