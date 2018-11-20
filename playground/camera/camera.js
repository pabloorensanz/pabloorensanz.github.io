var canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	camera = document.getElementById('camera');


function run () {
	// Get access to the camera!
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
			try {
				camera.srcObject = stream;
			} catch (error) {
				camera.src = window.URL.createObjectURL(stream);
			}
			camera.play();
		});
	} else {
		alert('Your browser doesn´t support playing with your webcam. Try latest Chrome version for example.');
	}
}