var camera = document.getElementById('camera');
var outputCanvas = document.getElementById('outputCanvas');
var outputContext = outputCanvas.getContext('2d');
var blendedCanvas = document.getElementById('blendedCanvas');
var blendedContext = blendedCanvas.getContext('2d');
var lastImageData = null;
var first = true;
var blockIt = false;

function run () {
	//get access to the camera!
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
			try {
				camera.srcObject = stream;
			} catch (error) {
				camera.src = window.URL.createObjectURL(stream);
			}
			
			console.log(camera.width+'x'+camera.height+'px');
			go();
		});
	} else {
		alert('Your browser doesn´t support playing with your webcamera. Try latest Chrome version for example.');
	}
}

function checkZone () {
	var zoneSize = 10;
	for(i = 0; i < camera.width / zoneSize; i++) {
		for(j = 0; j < camera.height / zoneSize; j++) {
			//console.log(i+'-'+j);
			if(detectMovementInArea(i*zoneSize, j*zoneSize, (i+1)*zoneSize, (j+1)*zoneSize)) {
				outputContext.beginPath();
				outputContext.arc(i*zoneSize,j*zoneSize,zoneSize,0,2*Math.PI);
				outputContext.stroke();
			}
		}
	}
}

function delayIt () {
	blockIt = true;
	setTimeout(function() {
		blockIt = false;
	}, 1000);
}

function go() {
	blendedContext.drawImage(camera, 0, 0, camera.width, camera.height);
	blend();
	outputContext.drawImage(camera, 0, 0, camera.width, camera.height);
	//checkZone();
	
	if(!blockIt) {
		if(detectMovementInArea(0, 0, 100, 480)) {
			//acción izda
			console.log('IZDA');
			if(!first) {
				outputCanvas.classList.remove('rotate');
			}	
			delayIt();
			first = false;			
		}
		if(detectMovementInArea(540, 0, 100, 480)) {
			//acción dcha
			console.log('DCHA');
			if(!first) {
				outputCanvas.classList.add('rotate');
			}	
			delayIt();
			first = false;
		}
	}
	
	timeOut = setTimeout(go, 1000/60);
}

function blend () {
	var width = blendedCanvas.width;
	var height = blendedCanvas.height;
	var sourceData = blendedContext.getImageData(0, 0, width, height);

	//create an image if the previous image doesn’t exist
	if (!lastImageData) {
		lastImageData = blendedContext.getImageData(0, 0, width, height);
	}
	//create a ImageData instance to receive the blended result
	var blendedData = blendedContext.createImageData(width, height);
	//blend the 2 images
	differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
	//draw the result in a blendedCanvas
	blendedContext.putImageData(blendedData, 0, 0);
	//store the current webcamera image
	lastImageData = sourceData;
}

function threshold (value) {
	return (value > 0x15) ? 0xFF : 0;
}

function difference (target, data1, data2) {
	//blend mode difference
	if (data1.length != data2.length) {
		return null;
	}
	var i = 0;
	while (i < (data1.length * 0.25)) {
		target[4*i] = data1[4*i] == 0 ? 0 : abs(data1[4*i] - data2[4*i]);
		target[4*i+1] = data1[4*i+1] == 0 ? 0 : abs(data1[4*i+1] - data2[4*i+1]);
		target[4*i+2] = data1[4*i+2] == 0 ? 0 : abs(data1[4*i+2] - data2[4*i+2]);
		target[4*i+3] = 0xFF;
		++i;
	}
}

function abs(value) {
	// funky bitwise, equal Math.abs
	return (value ^ (value >> 31)) - (value >> 31);
}

function differenceAccuracy(target, data1, data2) {
	if (data1.length != data2.length) {
		return null;
	}
	var i = 0;
	while (i < (data1.length * 0.25)) {
		var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
		var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
		var diff = threshold(abs(average1 - average2));
		target[4*i] = diff;
		target[4*i+1] = diff;
		target[4*i+2] = diff;
		target[4*i+3] = 0xFF;
		++i;
	}
}

function detectMovementInArea(left, top, width, height) {
	//get the pixels in an area
	var blendedData = blendedContext.getImageData(left, top, width, height);
	var i = 0;
	var average = 0;
	//oop over the pixels
	while(i < (blendedData.data.length * 0.25)) {
		//make an average between the color channel
		average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
		++i;
	}
	//calculate an average between of the color values of the note area
	average = Math.round(average / (blendedData.data.length * 0.25));
	if(average > 10) {//over a small limit, consider that a movement is detected
		console.log('moved in');
		return true;
	} else {
		//console.log('stopped or moved out');
		return false;
	}
}				