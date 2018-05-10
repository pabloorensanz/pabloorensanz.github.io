//Elements for taking the snapshot
var video = document.getElementById('video'),
	canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d'),
	subject_id;

//Get access to the camera!
if(navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.srcObject = stream;
    });
} else {
	alert('No puedo reconocer tu cara si no activas tu cámara y no tienes un navegador actualizado :(');
}

//Trigger snapshot take
function camera () {
	//video.srcObject.getVideoTracks().forEach(track => track.start());
	$('.view:not(#camera)').hide();
	$('#camera').show();
	return false;
}

function snapshot () {
	var width = $('#video').width(),
		height = $('#video').height();
	$('#canvas').attr('width', width);
	$('#canvas').attr('height', height);
	context.drawImage(video, 0, 0, width, height);
	//video.srcObject.getVideoTracks().forEach(track => track.stop());
	
	$('.view:not(#snapshot)').hide();
	$('#snapshot').show();
	
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
		if(response.hasOwnProperty('Errors')) {
			$('#snapshot div:not(#nofaces)').hide();
			$('#nofaces').show();
		} else {
			if(response.images[0].hasOwnProperty('candidates')) {
				subject_id = response.images[0].candidates[0].subject_id;
				$('#recognized label').html('Hola '+subject_id+' <small>('+Math.floor(response.images[0].candidates[0].confidence*100)+'%)</small>');
				//$.each(response.images[0].candidates, function(index, value) {
				//	$('#recognized label').append(value.subject_id+' ('+Math.floor(value.confidence*100)+'%)\r\n');
				//});
				$('#snapshot div:not(#recognized)').hide();
				$('#recognized').show();
			} else {
				$('#snapshot div:not(#notrecognized)').hide();
				$('#notrecognized').show();
			}
		}
	});
	return false;
}

function saved () {
	$('#snapshot div:not(#saved)').hide();
	$('#saved').show();
	subject_id = $('input[name="subject_id"]').val();
	$('input[name="subject_id"]').val('');
	$('#saved label').html('Encantado de saludarte '+subject_id);
	enroll();
	return false;
}

function enroll () {
	console.log(subject_id);
	var data = {
			'image': canvas.toDataURL('image/jpeg', 1.0),
			'subject_id': subject_id,
			'gallery_name': 'MyGallery'
		}
	kairos('enroll', data);
	return false;
}

function kairos (action, data) {
	var url = 'https://pabloorensanz.000webhostapp.com/playground/face_recognition/kairos.php?action='+action;
	//console.log(data);
	return $.ajax({
		url: url,
		type: 'POST',
		data: data,
		dataType: 'text',
		complete: function(response){
			//console.log(response);
		}
	});
}

function log(data) {
	console.log(data);
	return false;
}