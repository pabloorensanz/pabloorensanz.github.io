//camera
var camera = document.getElementById('camera');
//output
var outputCanvas = document.getElementById('outputCanvas');
var outputContext = outputCanvas.getContext('2d');
//blended
var blendedCanvas = document.getElementById('blendedCanvas');
var blendedContext = blendedCanvas.getContext('2d');
var lastImageData = null;
//object
var object = new Image();
var objectArea = [];
setObjectArea();
object.src = 'apple.png';
//gameconfig
var gameStatus = 'intro';
var areaChanged = false;
var points = 0;
var countDown = 3;
var frame = 0;
var framesPerSecond = 10;

function init () {
	//get access to the camera!
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
			camera.srcObject = stream;
			stream.getTracks().forEach(function(track) {
				if(track.getSettings().facingMode == 'user') {
					camera.setAttribute('width', track.getSettings().width);
					camera.setAttribute('height', track.getSettings().height);
				}
			})
			try {
				camera.srcObject = stream;
			} catch (error) {
				camera.src = window.URL.createObjectURL(stream);
			}
			run();
		});
	} else {
		alert('Your browser doesn´t support playing with your webcamera. Try latest Chrome version for example.');
	}
}

function frameToSecond () {
	
}

function setObjectArea () {
	var x = Math.floor(Math.random() * (640-object.width));
	var y = Math.floor(Math.random() * (480-object.height));
	objectArea = [x, y, object.width, object.height];
	//console.log(objectArea);
}

function run () {
	frame++;
	//console.log('gameStatus: '+gameStatus);
	
	switch (gameStatus) {
		case 'intro':
			//draw
			//outputContext.scale(-1, 1);
			outputContext.drawImage(camera, 0, 0, camera.width, camera.height);
			outputContext.drawImage(object, objectArea[0], objectArea[1]);
			//layer
			outputContext.fillStyle = 'rgba(0, 0, 0, 0.75)';
			outputContext.fillRect(0, 0, 640, 480);
			//text
			outputContext.fillStyle = 'white';
			outputContext.textAlign = 'center'; 
			outputContext.font = '36px Arial';
			outputContext.fillText('¡Vamos a coger manzanas!', 320, 200);
			outputContext.font = '18px Arial';
			outputContext.fillText('Mueve las manos delante de la cámara hasta coger la manzana', 320, 250);
			//countdown
			pauseTime = 5;
			countDown = pauseTime - Math.floor(frame / framesPerSecond);
			outputContext.fillText('Empezamos en '+countDown+'...', 320, 300);
			if(countDown <= 1) {
				setObjectArea();
				gameStatus = 'play';	
			}
			break;
		case 'play':
			//draw
			
			outputContext.drawImage(camera, 0, 0, camera.width, camera.height);
			
			outputContext.drawImage(object, objectArea[0], objectArea[1]);
			//checking
			if(isImageAreaChanged(objectArea) && !areaChanged) {
				console.log('checking... OK!!');
				blendedContext.clearRect(0, 0, blendedCanvas.width, blendedCanvas.height);
				gameStatus = 'pause';
				pauseFrame = frame;
				points++;
				areaChanged = true;
			} else {
				console.log('checking... KO');
				areaChanged = false;
			}
			//points
			outputContext.font = '14px Arial';
			outputContext.fillText('Manzanas cogidas '+points, 320, 25);
			break;
		case 'pause':
			//draw
			outputContext.drawImage(camera, 0, 0, camera.width, camera.height);
			//layer
			outputContext.fillStyle = 'rgba(0, 0, 0, 0.75)';
			outputContext.fillRect(0, 0, 640, 480);
			//text
			outputContext.fillStyle = 'white';
			outputContext.textAlign = 'center'; 
			outputContext.font = '36px Arial';
			outputContext.fillText('¡Perfecto has cogido '+points+' manzanas!', 320, 200);
			outputContext.font = '18px Arial';
			outputContext.fillText('Mueve las manos delante de la cámara hasta coger la manzana', 320, 250);
			//countdown
			pauseTime = 3;
			countDown = pauseTime - Math.floor((frame - pauseFrame) / framesPerSecond );
			outputContext.fillText('Volvemos a empezar en '+countDown+'...', 320, 300);
			if(countDown <= 1) {
				setObjectArea();
				gameStatus = 'play';	
			}
			break;
	}
	//console.log('frame: '+frame)
	setTimeout(run, 1000 / framesPerSecond);
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
	blendedContext.strokeStyle = "#FF0000";
	blendedContext.strokeRect(objectArea[0], objectArea[1], objectArea[2], objectArea[3]);
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

function isImageAreaChanged() {
	blendedContext.drawImage(camera, 0, 0, camera.width, camera.height);
	blend();
	//get the pixels in an area
	var blendedData = blendedContext.getImageData(objectArea[0], objectArea[1], objectArea[2], objectArea[3]);
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
	//console.log(average);
	if(average > 100) {//over a small limit, consider that a movement is detected
		//console.log('moved in');
		return true;
	} else {
		//console.log('stopped or moved out');
		return false;
	}
}				