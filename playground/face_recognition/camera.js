//Elements for taking the snapshot
var video = document.getElementById('video'),
	canvas = document.getElementById('canvas');

//Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });
} else {
	alert('Your browser doesn´t support playing with your webcam. Try latest Chrome version for example.');
}

//Trigger snapshot take
function camera () {
	$('.view:not(#camera)').hide();
	$('#camera').show();
	return false;
}

function snapshot () {
	var width = $('#video').width(),
		height = $('#video').height();
	$('#canvas').attr('width', width);
	$('#canvas').attr('height', height);
	$('.view:not(#snapshot)').hide();
	console.log(video.width+'-'+video.height);
	$('#snapshot').show();
	canvas.getContext('2d').drawImage(video, 0, 0, width, height);
	recognize();
	return false;
}

function recognize () {
	$('#snapshot div:not(#searching)').hide();
	$('#searching').show();
	
	var data = {
			'image': canvas.toDataURL('image/jpeg', 1.0),
			'gallery_name': 'MyGallery'
		}
	kairos('recognize', data).done(function(response) {
		response = JSON.parse(response);
		console.log(response);
		if(response.hasOwnProperty('Errors')) {
			$('#snapshot div:not(#nofaces)').hide();
			$('#nofaces').show();
		} else {
			if(response.images[0].hasOwnProperty('candidates')) {
				$('#snapshot div:not(#recognized)').hide();
				$('#recognized').show();
				$('#recognized label').html('Hola ');
				$.each(response.images[0].candidates, function(index, value) {
					$('#recognized label').append(value.subject_id+' ('+Math.floor(value.confidence*100)+'%)\r\n');
				});
			} else {
				$('#snapshot div:not(#notrecognized)').hide();
				$('#notrecognized').show();
			}
		}
	});
	return false;
}

function save () {
	subject_id = $('input[name="subject_id"]').val();
	console.log(subject_id);
	var data = {
			'image': canvas.toDataURL('image/jpeg', 1.0),
			'subject_id': subject_id,
			'gallery_name': 'MyGallery'
		}
	kairos('enroll', data).done(function(response) {
		console.log(response);
		$('#snapshot div:not(#saved)').hide();
		$('#saved').show();
		$('#saved label').html('Encantado de saludarte '+subject_id);
	});
	return false;
}

function kairos (action, data) {
	return $.ajax('https://api.kairos.com/'+action, {
		headers: {
			'Content-type': 'application/json',
			'app_id': 'fbd4af8e',
			'app_key': '03b3b9d3f8c90d5c4b8d7564c96b4fd7'
		},
		type: 'POST',
		data: JSON.stringify(data),
		dataType: 'text'
	}).fail(function(response){
		console.log(response);
	});
}

function log(data) {
	console.log(data);
	return false;
}