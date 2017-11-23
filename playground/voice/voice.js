var transcript = document.getElementById('transcript');
	final_transcript = '',
	recognizing = false

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
		if(final_transcript) transcript = capitalize(final_transcript);
		else transcript = interim_transcript;
		
		console.log(transcript);
		transcript.value = transcript;
	}
	recognition.onerror = function(event) {
		console.log('Error: '+event.error);
	}
	recognition.onend = function() {
		recognizing = false;
		console.log('fin');
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
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}