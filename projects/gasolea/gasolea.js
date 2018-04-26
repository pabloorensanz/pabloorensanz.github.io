(function ( $ ) {
	//GMAP
    $.fn.gmap = function(options) {
		var settings = {
				center: {},
				zoom: 15,
				markers: [],
				change: function () {},
				clicked: function () {}
			},
			deferred = new $.Deferred();
		
		this.render = function () {
			this.map = new google.maps.Map(document.getElementById('gmap'), {
				center: new google.maps.LatLng(settings.center.lat, settings.center.lng),
				zoom: settings.zoom,
				//zoomControl: false,
				streetViewControl: false,
				mapTypeControl: false,
				fullscreenControl: false,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
			google.maps.event.addListener(this.map, 'center_changed', function () {
				settings.change.call(this);
			});
			google.maps.event.addListener(this.map, 'zoom_changed', function () {
				settings.change.call(this);
			});
			google.maps.event.addListenerOnce(this.map, 'idle', function () {
				deferred.resolve();
			});
			this.markers = [];
			return deferred.promise();
		}
		this.markit = function (data) {
			var marker = new google.maps.Marker({
					map: this.map,
					position: new google.maps.LatLng(parseFloat(data.lat), parseFloat(data.lng)),
					title: data.title,
					icon: data.image,
					metadata : data
				});
			this.markers.push(marker);
			google.maps.event.addListener(marker, 'click', function() {
				console.log(marker);
				settings.clicked.call(this, marker);
			});
			return this;
		}
		this.pan = function (center) {
			this.map.panTo(new google.maps.LatLng(center.lat, center.lng));
			return this;
		}
		this.fitbounds = function () {
			var bounds = this.map.getBounds();
			this.map.fitBounds(bounds);
			return this;
		}
		this.animate = function (marker) {
			for(i = 0; i < this.markers.length; i++) this.markers[i].setAnimation(null);
			marker.setAnimation(google.maps.Animation.BOUNCE);
			return this;
		}
		this.clear = function () {
			this.markers.forEach(function (marker) {
				marker.setMap(null);
			})
		}
		this.viewport = function () {
			if(this.map) {
				var bounds = this.map.getBounds();
				console.log(bounds.getNorthEast().lat()+' '+bounds.getNorthEast().lng()+' '+bounds.getSouthWest().lat()+' '+bounds.getSouthWest().lng());
				return (bounds) ? [bounds.getNorthEast().lat(), bounds.getNorthEast().lng(), bounds.getSouthWest().lat(), bounds.getSouthWest().lng()] : []
			} else {
				return [];
			}
		}
		this.center = function () {
			var center = this.map.getCenter();
			return (center) ? {lat: center.lat(), lng: center.lng()} : {};
		} 
		this.set = function (options) {
			$.extend(settings, options);
			return this;
		}
		
		this.set(options);
		return this;
    };
	
	list = function(options) {
		var settings = {
				enableHighAccuracy: true,
				timeout: 5000
			};
		
		this.set = function (options) {
			$.extend(settings, options);
			return this;
		}
		
		this.set(options);
		return this;		
	}
	geolocation = function(options) {
		var settings = {
				enableHighAccuracy: true,
				timeout: 5000
			},
			deferred = $.Deferred();
		
		this.get = function(){
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (response) {
					console.log('geolo ok');
					deferred.resolve({
						lat: response.coords.latitude,
						lng: response.coords.longitude
					});
				}, function (response) {
					deferred.reject(response);
					
				}, {
					enableHighAccuracy: settings.enableHighAccuracy,
					timeout: settings.timeout
				})
			} else {
				deferred.reject(response);
			}
			
			return deferred.promise();
		}
		this.set = function (options) {
			$.extend(settings, options);
			return this;
		}
		
		this.set(options);
		return this;
    };
}(jQuery));