var canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	camera = document.getElementById('camera');


function run () {
	// Get access to the camera!
	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
			camera.src = window.URL.createObjectURL(stream);
			camera.play();
		});
	} else {
		alert('Your browser doesn´t support playing with your webcam. Try latest Chrome version for example.');
	}
}
			
/*

function go() {
	console.log('Should be working');
	draw_video();
	//blend();
	if(!first && !block) {
		if(get_areas(left_hand)) slideshow.carousel('prev');
		if(get_areas(right_hand)) slideshow.carousel('next');
	}
	console.log(block);
	timeOut = setTimeout(go, 1000/60);
}
			function unblock () {
				if(block) block = false;
				console.log('run unblock:'+block);
				setTimeout(unblock, 2500);
			}
			
			function blend() {
				var width = source_canvas.width,
					height = source_canvas.height,
					sourceData = source.getImageData(0, 0, width, height);
				
				// create an image if the previous image doesn’t exist
				if (!lastImageData) lastImageData = source.getImageData(0, 0, width, height);
				// create a ImageData instance to receive the blended result
				var blendedData = source.createImageData(width, height);
				// blend the 2 images
				differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
				// draw the result in a canvas
				blended.putImageData(blendedData, 0, 0);
				// store the current webcam image
				lastImageData = sourceData;
			}

			function fastAbs(value) {
				// funky bitwise, equal Math.abs
				return (value ^ (value >> 31)) - (value >> 31);
			}

			function threshold(value) {
				return (value > 0x15) ? 0xFF : 0;
			}

			function difference(target, data1, data2) {
				// blend mode difference
				if (data1.length != data2.length) return null;
				var i = 0;
				while (i < (data1.length * 0.25)) {
					target[4*i] = data1[4*i] == 0 ? 0 : fastAbs(data1[4*i] - data2[4*i]);
					target[4*i+1] = data1[4*i+1] == 0 ? 0 : fastAbs(data1[4*i+1] - data2[4*i+1]);
					target[4*i+2] = data1[4*i+2] == 0 ? 0 : fastAbs(data1[4*i+2] - data2[4*i+2]);
					target[4*i+3] = 0xFF;
					++i;
				}
			}

			function differenceAccuracy(target, data1, data2) {
				if (data1.length != data2.length) return null;
				var i = 0;
				while (i < (data1.length * 0.25)) {
					var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
					var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
					var diff = threshold(fastAbs(average1 - average2));
					target[4*i] = diff;
					target[4*i+1] = diff;
					target[4*i+2] = diff;
					target[4*i+3] = 0xFF;
					++i;
				}
			}

			function get_areas(obj) {
				//get the pixels in an area
				var blendedData = blended.getImageData(obj.position().left, obj.position().top, obj.width(), obj.height());
				
				var i = 0;
				var average = 0;
				// oop over the pixels
				while(i < (blendedData.data.length * 0.25)) {
					//make an average between the color channel
					average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
					++i;
				}
				// calculate an average between of the color values of the note area
				average = Math.round(average / (blendedData.data.length * 0.25));
				if(average > 10) {
					//over a small limit, consider that a movement is detected
					block = true;
					obj.addClass('active').delay(1000).queue(function(next){
						obj.removeClass('active');
						block = false;
						next();
					});
					//console.log('moved in');
					return true;
				} else {
					//console.log('stopped or moved out');
					return false;
				}
			}
		}
*/