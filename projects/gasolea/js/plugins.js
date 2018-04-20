(function ($) {
	var map,
		settings = {
			//URL
			markersUrl: '',
			markerImageUrl: '',
			bubbleUrl: '',
			//MAP
			center: {lat: 40.416944, lng: -3.703611},
			zoom: 14,
			zoomControl: false,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL,
				position: google.maps.ControlPosition.TOP_RIGHT
			},
			streetViewControl: false,
			mapTypeControl: false,
			//TEMPLATES
			bubbleTemplate: '',
			//TIMEOUT
			timeOutAjax: 5000,
			timeOutChange: 1000,
			timeOutGeolocate: 25000,
		}

    $.fn.gmap = function(options) {
		$.extend(settings, options);
		var self = this,
			trigger = function (event, result) {
				self.trigger(event);
				event = 'on'+event.charAt(0).toUpperCase()+event.slice(1);
				if(event in settings) settings[event].call(self, result);
			};
		
		this.myPosition = {};
		this.markers = [];
		this.bounds = [];
		this.bubble = new google.maps.InfoWindow({'zIndex': 1000});
		this.timer = null;
		
		this.geolocation = function () {
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					function (result) {
						self.myPosition = {lat: result.coords.latitude, lng: result.coords.longitude};
						if('onGeolocationDone' in settings) settings['onGeolocationDone'].call(self, self.myPosition);
					}, function (error) {
						trigger('geolocationFailed', error);
					}, {
						enableHighAccuracy: true, timeout : settings.timeOutGeolocate
					}
				)
			} else {
				trigger('geolocationFailed');
			}
			return this;
		}
		this.iplocation = function (url) {
			getJson(url, settings.timeoutAjax, function(data) {
				if(data) {
					self.myPosition = ({lat: data.lat, lng: data.lng});
					trigger('iplocationDone', self.myPosition);
				}else callback();
			}, function () {
				trigger('iplocationFailed');
			})
			return this;
		}
		this.getCity = function (callback) {
			getJson('http://maps.googleapis.com/maps/api/geocode/json?latlng='+settings.center.lat+','+settings.center.lng+'&sensor=false', settings.timeoutAjax, {}, function(data) {
				var city = data['results'][0]['address_components'][2]['long_name'];
				callback(city);
			});
		}
		this.mapLoad = function () {
			var latLng = new google.maps.LatLng(settings.center.lat, settings.center.lng);
			map = new google.maps.Map(document.getElementById(self.attr('id')), {
				center: latLng,
				zoom: settings.zoom,
				zoomControl: settings.zoomControl,
				zoomControlOptions: settings.zoomControlOptions,
				streetViewControl: settings.streetViewControl,
				mapTypeControl: settings.mapTypeControl,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
			google.maps.event.addListener(map, 'dragend', function () {
				clearTimeout(self.timer);
				self.timer = setTimeout(function () {
					self.mapChanged();
				}, settings.timeOutChange);
			});
			google.maps.event.addListener(map, 'zoom_changed', function () {
				clearTimeout(self.timer);
				self.timer = setTimeout(function () {
					self.mapChanged();
				}, settings.timeOutChange);
			});
			google.maps.event.addListenerOnce(map, 'idle', function () {
				settings.viewport = self.getViewport();
				settings.zoom = self.getZoom();
				trigger('mapLoadDone', {'center': settings.center, 'viewport': settings.viewport, 'zoom': settings.zoom});
			});
			
			Mustache.parse(settings.bubbleTemplate);
			return this;
		}
		this.mapChanged = function () {
			settings.center = self.getCenter();
			settings.viewport = self.getViewport();
			settings.zoom = self.getZoom();
			trigger('mapChanged', {'center': settings.center, 'viewport': settings.viewport, 'zoom': settings.zoom});
		}
		this.markersLoad = function (data) {
			self.bounds = new google.maps.LatLngBounds();
			getJson(settings.markersUrl, settings.timeoutAjax, data, function(response) {
				var responseCount = response.length,
					markersData = [];
				
				if(responseCount) {
					for(var i = 0; i < responseCount; i++) {
						response[i].range = range(response[i].rank);
						markersData[response[i].id] = response[i];
						self.bounds.extend(new google.maps.LatLng(response[i].lat, response[i].lng));						
					}
				}
				trigger('markersLoadDone', markersData);
			}, function() {
				trigger('markersLoadFailed');
			})
			
			return this;
		}
		this.markersRender = function (markersData) {
			markersData.forEach(function(markerData) {
				if(!(markerData.id in self.markers)) {			
					if(markerData.range) {
						var image = {
							url: settings.markerImageUrl+markerData.range+'.png',
							size: new google.maps.Size(27, 37),
							origin: new google.maps.Point(0,0),
							anchor: new google.maps.Point(0, 37)
						}
					}
					var position = new google.maps.LatLng(parseFloat(markerData.lat), parseFloat(markerData.lng)),
						marker = new google.maps.Marker({
							map: map,
							position: position,
							icon: image,
							metadata: {
								type: 'point', 
								id: markerData.id,
								range: markerData.range
							}
						});
					
					google.maps.event.addListener(marker, 'click', function() {
						trigger('markerClicked', marker);
					});
					
					self.markers[markerData.id] = marker;
				}
			});
		}
		this.bubbleRender = function (marker, data) {
			getJson(settings.bubbleUrl, settings.timeoutAjax, data, function(data) {
				var rendered = Mustache.render(settings.bubbleTemplate, data[0]);
				self.bubble.setContent(rendered);
				self.bubble.open(map, marker);
			})
			
			google.maps.event.addListener(self.bubble, 'closeclick', function() {
				trigger('bubbleClosed', marker.metadata.id);
			});
		}
		this.bubbleClose = function () {
			self.bubble.close();
		}
		this.mapClear = function () {
			self.bubbleClose();
			self.markers.forEach(function (marker) {
				marker.setMap(null);
			})
			self.markers = [];
			trigger('mapCleared');
			return this;
		}
		this.fitBounds = function () {
			map.fitBounds(self.bounds);
			return this;
		}	
		this.pan = function (center, zoom) {
			if(center) {
				if(zoom === undefined) zoom = settings.zoom;
				
				map.panTo(new google.maps.LatLng(center.lat, center.lng));
				map.setZoom(zoom);
			}
			
			return this;
		}
		this.zoomIn = function () {
			var zoom = self.getZoom();
			zoom++;
			map.setZoom(zoom);
			return this;
		}
		this.zoomOut = function () {
			var zoom = self.getZoom();
			zoom--;
			map.setZoom(zoom);
			return this;
		}
		this.getCenter = function () {
			var center = map.getCenter();
			return (center) ? {lat: center.lat(), lng: center.lng()} : {};
		}
		this.getViewport = function () {
			var bounds = map.getBounds();
			return (bounds) ? [bounds.getNorthEast().lat(), bounds.getNorthEast().lng(), bounds.getSouthWest().lat(), bounds.getSouthWest().lng()] : [];
		}
		this.getZoom = function () {
			return map.getZoom();
		}
		this.setSettings = function (key, value) {
			if(key in settings) settings[key] = value;
			else $.extend(settings, {key: value});
			return this;
		}

		return this;
	}
}(jQuery));

(function ($) {
	var input,
		settings = {
			types: ['(cities)'],
			componentRestrictions: {'country': 'es'},
		}
		
	$.fn.places = function(options) {
		$.extend(settings, options);
		var self = this,
			trigger = function (event, result) {
				self.trigger(event);
				event = 'on'+event.charAt(0).toUpperCase()+event.slice(1);
				if(event in settings) settings[event].call(self, result);
			};
		
		this.input = null;
		
		this.load = function () {
			self.input = new google.maps.places.Autocomplete(document.getElementById(self.attr('id')), {
				types: settings.types,
				componentRestrictions: settings.componentRestrictions
			});
			google.maps.event.addListener(self.input, 'place_changed', function () {
				trigger('selected', input);
			})
			return this;
		},
		this.query = function () {
			
		},
		this.placeCenter = function () {
			var place = self.input.getPlace();
			if(place.geometry) {
				var location = place.geometry.location;
				return {lat: location.lat(), lng: location.lng()} 
			}
			return this;
		}
		return this;
	}
}(jQuery));

(function ($) {
	var settings = {
			//URL
			listUrl: '',
			//TEMPLATES
			itemTemplate: '',
			//TIMEOUT
			timeOutAjax: 5000,
		}
		
	$.fn.list = function(options) {
		$.extend(settings, options);
		var self = this,
			trigger = function (event, result) {
				self.trigger(event);
				event = 'on'+event.charAt(0).toUpperCase()+event.slice(1);
				if(event in settings) settings[event].call(self, result);
			};
			
		this.lines = [];
		
		this.listLoad = function () {
			Mustache.parse(settings.itemTemplate);
			return this;
		}
		this.linesLoad = function (data) {
			getJson(settings.listUrl, settings.timeoutAjax, data, function(data) {
				var dataCount = data.length;
				if(dataCount) for(var i = 0; i < dataCount; i++) self.lines[data[i].id] = data[i];
				trigger('linesLoadDone', dataCount);
			}, function() {
				trigger('linesLoadFailed');
			})
			return this;
		}
		this.linesRender = function () {
			self.lines.forEach(function(line) {
				line.range= range(line.rank);
				var rendered = Mustache.render(settings.itemTemplate, line);
				self.append(rendered);
			});
		}
		this.listClear = function () {
			self.lines = [];
			self.find('div.list-group-item').not('.disabled').remove();
			trigger('linesClear');
			return this;
		}
		this.setSettings = function (key, value) {
			if(key in settings) settings[key] = value;
			else $.extend(settings, {key: value});
			return this;
		}

		return this;
	}
}(jQuery));

$.fn.formToObject = function () {
    var o = {},
		a = this.serializeArray();
    
	$.each(a, function() {
		if(o[this.name] !== undefined) {
			if(!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	
	return o;
}

function findObjectInArray (array, property, propertyName) {
    for(var i = 0, len = array.length; i < len; i++) {
        if(array[i].property === purposeName)
            return array[i]; // Return as soon as the object is found
    }
    return null; // The object was not found
}

function countProperties (o) {
	var count = 0;
	var i;

	for (i in o) {
		if(o.hasOwnProperty(i)) {
			count++;
		}
	}
	
	return count;
}

function getJson (url, timeOutAjax, data, callbackDone, callbackFail) {
	$.ajax({
		dataType: 'json',
		url: url, 
		data: data, 
		timeout: timeOutAjax/*,
		beforeSend: function( xhr, settings ) {
			console.log('beforeSend');
			console.log(data);
			console.log(settings);
		}*/
	})
	.done(function(response) {
		console.log('done: '+url+'?'+$.param(data)+', success');
		if(callbackDone) callbackDone(response);
	})
	.fail(function(jqXHR, status, error) {
		console.log('fail: '+url+'?'+$.param(data)+', '+error);
		if(callbackFail) callbackFail(status);
	})			
	return;
}

function range (rank) {
	if(rank < 8) return 'cheap';
	else if(rank >= 8 && rank < 40) return 'medium';
	else return 'expensive';
}

function socialShare (param) {
	url = 'http://www.gasolea.com/search.php?'+$.param(param);
	title = 'La #gasolina más #barata de #'+param.city+' en gasolea.com ';
	$('#twitterShare').html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+url+'" data-text="'+title+'" data-via="gasoleacom">Twittear !</a>');
	twttr.widgets.load();
	
	$('#facebookShare').html('<fb:like href="'+url+'" layout="button_count" show_faces="false" width="55" action="like" font="segoe ui" colorscheme="light" />');
	if(typeof FB !== 'undefined') {
		FB.XFBML.parse(document.getElementById('facebookShare'));
	}
}

function url (page, params) {
	//buscar/center/.../zoom/.../ranges/.../fuels/.../sort/...
	//en/country/region1/region2/region3/region4/ranges/fuels/sort
	//gasolineras/name/ranges/.../fuels/.../sort/...
	if(page == 'buscar') {
	
	}
	if(page == 'en') {
	
	}
	if(page == 'gasolineras') {
	
	} 
	
	return '?q='+page+'/';
}