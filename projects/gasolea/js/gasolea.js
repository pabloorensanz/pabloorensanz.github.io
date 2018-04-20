$(document).ready(function() {
	//GMAP
	statusBar.slideDown({start: function () { statusBar.find('span').html('Buscando ubicación...') } });
	gmapOBJ.gmap($.extend(gmapOptions, {
		markersUrl: 'json.php',
		markerImageUrl: 'files/',
		bubbleUrl: 'json.php',
		bubbleTemplate: bubbleTemplate,
		onGeolocationDone: function (result) {
			myPosition = result;
			$.cookie('myPosition', myPosition);
			$('#myPosition').css('color', '#74cbf0');
		},
		onGeolocationFailed: function () {
			if(!(visits % 5)) geolocationModal.modal();
		},
		onMapLoadDone: function (result) {
			$.cookie('zoom', result.zoom);
			$.cookie('center', result.center);
			params.viewport = result.viewport;
			if(!fitBounds) this.markersLoad({'type': 'findMarkers', 'params': params});
		},
		onMapChanged: function (result) {
			console.log('MAP CHANGED');
			statusBar.slideDown({start: function () { statusBar.find('span').html('Cargando gasolineras...') } });
			$.cookie('zoom', result.zoom);
			$.cookie('center', result.center);
			params.viewport = result.viewport;
			fitBounds = false;
			this.markersLoad({'type': 'findMarkers', 'params': params});
		},
		onMarkersLoadDone: function (result) {
			round = 1;
			
			if(fitBounds) gmapOBJ.mapLoad().fitBounds();
			else listOBJ.listClear().linesLoad({'round': round, 'sort': sort, 'params': params, 'myPosition': myPosition});
			
			this.markersRender(result);			
		},
		onMarkerClicked: function (result) {
			$('.list-group-item').removeClass('clicked');
			$('div[data-id="'+result.metadata.id+'"].list-group-item').addClass('clicked');
			this.bubbleRender(result, {'type': 'findById', 'id': result.metadata.id, 'params': params});
		},
		onBubbleClosed: function (result) {
			$('.list-group-item').removeClass('clicked');
		}
	}));
	
	gmapOBJ.geolocation();
	if(params.en || params.gasolineras || params.special) {
		fitBounds = true;
		gmapOBJ.markersLoad({'type': 'findMarkers', 'params': params});
	} else if(zoom && center) {
		gmapOBJ.setSettings('zoom', zoom).setSettings('center', center).mapLoad();
	} else {
		gmapOBJ.load();
	}
	
	//LIST
	listOBJ.list({
		listUrl: 'json.php?type=findList',
		itemTemplate: itemTemplate,
		'onLinesLoadDone': function (result) {
			listOBJ.linesRender();
			if(result >= 5) infinite = true;
			bottom = listOBJ.offset().top + $('#list').height();
			statusBar.slideUp();
			$('.list-group-item').click(function () {
				var id = $(this).data('id');
				if(id) {
					$('.list-group-item').not(this).removeClass('lineActive');
					marker = gmapOBJ.markers[id];
					if(marker) {
						if($(this).hasClass('lineActive')) {
							$(this).removeClass('lineActive');
							gmapOBJ.bubbleClose();
							marker.setAnimation(null);
						} else {
							$(this).addClass('lineActive');
							gmapOBJ.bubbleRender(marker, {'type': 'findById', 'id': id, 'params': params});
							marker.setAnimation(google.maps.Animation.BOUNCE);
						}
					}
				}
			}).hover(
				function () {
					var id = $(this).data('id')
					if(id) {
						marker = gmapOBJ.markers[id];
						if(marker) marker.setAnimation(google.maps.Animation.BOUNCE);
					}
				},
				function () {
					var id = $(this).data('id');
					if(id) {
						marker = gmapOBJ.markers[id];
						if(marker) marker.setAnimation(null);
					}
				}
			);
		}
	}).load();
	$(window).scroll(function() {
		if($(window).scrollTop() + $(window).height() >= bottom && infinite) {
			infinite = false;
			round++;
			statusBar.slideDown({start: function () { statusBar.find('span').html('Cargando gasolineras...') } });
			listOBJ.linesLoad({'round': round, 'sort': sort, 'params': params, 'myPosition': myPosition});
		}
	});
	sortOBJ.change(function () {
		sort = $(this).val();
		$.cookie('sort', sort);
		$('#sort>button>img.fuel, #sort>button>span.placeholder').fadeOut(function () {
			$('#sort>button>img.fuel[data-value="'+sort+'"]').fadeIn();
		});
		
		statusBar.slideDown({start: function () { statusBar.find('span').html('Ordenando...') } });
		round = 1;
		listOBJ.listClear().linesLoad({'round': round, 'sort': sort, 'params': params, 'myPosition': myPosition});
	});

	//PLACES
	placesOBJ.places({
		onSelected: function () {
			center = placesOBJ.placeCenter();
			$.cookie('center', center);
			gmapOBJ.pan(center, 12);
			//listOBJ.listClear().linesLoad({'round': round, 'sort': sort, 'params': params, 'myPosition': myPosition});
		}
	}).focusin(function () { 
		previous = placesOBJ.val();
		placesOBJ.val(''); 
	}).focusout(function () { 
		placesOBJ.val(previous); 
	}).load();

	//FILTERS
	$('#ranges, #fuels').find('.dropdown-menu>li>label,.dropdown-menu>li>label>input').click(function(e) { e.stopPropagation(); });
	filterOBJ.change(function () {
		var filterInput = $(this),
			filterValue = filterInput.val();
			filterImage = filterInput.closest('div').find('img[data-value="'+filterValue+'"]');

		if(filterInput.attr('name') == 'fuels') {
			sortInput = $('#sort').find('li[data-value="'+filterValue+'"]');
			sortImage = $('#sort').find('img.fuel[data-value="'+filterValue+'"]');
			sortPlaceholder = $('#sort').find('.placeholder');
		}
			
		if(filterInput.is(':checked')) {
			filterImage.fadeIn();
			if(filterInput.attr('name') == 'fuels') sortInput.show();
		} else {
			filterImage.fadeOut();
			if(filterInput.attr('name') == 'fuels') {
				sortInput.hide();
				if(sortInput.find('input').prop('checked')) {
					sortImage.fadeOut(function () { sortPlaceholder.fadeIn(); });
					sortInput.find('input').prop('checked', false);
				}
			}
		}
					
		clearTimeout(timer);
		timer = setTimeout(function () {
			statusBar.slideDown({start: function () { statusBar.find('span').html('Cargando gasolineras...') } });
			
			filters = filterOBJ.formToObject();
			ranges = filters['ranges'];
			fuels = filters['fuels']
			$.cookie('ranges', ranges);
			$.cookie('fuels', fuels);
			gmapOBJ.mapClear().dump(params);
		}, 1000);
	});
		

	$('#zoomIn').click(function () {
		gmapOBJ.zoomIn();
	});
	$('#zoomOut').click(function () {
		gmapOBJ.zoomOut();
	});
	$('#myPosition').click(function () {
		if(!$.isEmptyObject(myPosition)) {
			gmapOBJ.pan(myPosition, 12);
		} else {
			window.history.pushState(null, "", "<?php print ABSURL; ?>search.php/?q=modal/Tu_Ubicacion");
			$('#geolocatedWarning').modal();
		}
	});
	$('#socialContainer').click(function () {
		var city = gmapOBJ.getCity(function (city) {
			city = city.replace(/\s/g, '');
			console.log('city: '+city);

			//socialShare({'center': gmapOBJ.getCenter(), 'zoom': gmapOBJ.getZoom(), 'ranges': ranges, 'fuels': fuels, 'place': place, 'city': city});
		});
	});

$.cookie('visits', visits + 1);
})