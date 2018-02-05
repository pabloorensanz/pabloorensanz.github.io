var myLat = 41.403812099999996; //myLat por defecto
var myLng = 2.1912042; //myLng por defecto
var map;
var infowindow;

function startMap (callback) {
	if (navigator.geolocation) {
		var location_timeout = setTimeout('', 10000);
		navigator.geolocation.getCurrentPosition(function(position) {
			clearTimeout(location_timeout);
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;
							
			console.log('Your position: '+myLat+'-'+myLng);
			
			if(callback) callback();
			drawMarker(map, myLat, myLng, '<b>You!</b><br/>You are here<br/><br/><a href="https://www.google.es/maps/@'+myLat+','+myLng+'z?hl=en&authuser=0" target="_blank" class="btn btn-primary btn-sm active">Google maps view</a>');
		}, function(error) {
			clearTimeout(location_timeout);
			alert('Can´t locate you with this device :( ... More technical explanation: '+error.message);
		});
	} else {
		alert('Not possible to find your location... We´ll place you wherever we want ;)');
	}
}

function renderMap () {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: myLat, lng: myLng},//centrado en mi ubicación
		zoom: 11,
		disableDefaultUI: true,
	})
}

function drawMarker (map, lat, lng, text) {
	var marker = new google.maps.Marker({
		position: {lat: lat, lng: lng},
		map: map,
		//title: 'Marker',
		//icon: icono
	});
	var infowindow = new google.maps.InfoWindow();
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(text);
		infowindow.open(map, this);
	});
}