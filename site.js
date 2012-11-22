function mmg_google_docs(id, callback) {
	if (typeof reqwest === 'undefined') {
		throw 'CSV: reqwest required for mmg_csv_url';
	}
	function response(x) {
		var features = [],
			latfield = '',
			lonfield = '';
		if (!x || !x.rows) return features;
		for (var i = 0; i < x.rows.length; i++) {
			var entry = x.rows[i];
			var timeStamp = entry[0];
			var hideOnMap = entry[1];
			var title = entry[2];
			var address = entry[3];
			var dateAndTimes = entry[4];
			var description = entry[5];
			if (entry[6].replace(/ /g, "") != "") {
				var status =  "<h5 class='cardStatus'>" + entry[6] + "</h5>";
			}
			else {
				status = "";
			}			
			var link = entry[7];
			var contactInfo = entry[8];
			var region = entry[9].toLowerCase().replace(/ /g, '-');
			var state = entry[10];
			var latitude = entry[11];
			var longitude = entry[12];
			var ignoreTimestamp = entry[13];
			var type = entry[14].replace(/ and /g, ' ').replace(/ only /g, ' ').toLowerCase();
			var typeMarker = entry[15];
			var showHide = entry[16];
			var defaultUrgent = entry[17];
			var symbol = "star-stroked";
			var mc = "#777";
			var ms = "small";
			switch (type) {
			case "main distribution center":
				mc = "#da521f";
				break;
			case "drop-off only":
				// change color to green
				mc = "#22b573";
				break;
			case "volunteer drop-off":
			    mc = "#00a99d";
			    break;
			case "volunteer":
				// change color to blue
				mc = "#0085bf";
				break;
			case "meals":
				// change color to purple
				mc = "#60f";
				break;
			}
			switch (typeMarker) {
			case "dining":
				symbol = "restaurant";
				mc = "#ffcd67";
				break;
			case "rail":
				symbol = "bus";
				mc = "#ffcc00";
				break;
			}
			var status = entry[6];
			var defaultUrgent = entry[17];
			var region = entry[9].toLowerCase().replace(/ /g, '-');
			var state = entry[10];
			var latitude = entry[11];
			var longitude = entry[12];
			var ignoreTimestamp = entry[13];
			if (entry[0].replace(/ /g, '') == "") {
				var timeStamp = "";
			} else {
				var timeStamp = "<h5 class='cardUpdated'>" + entry[0] + "</h5>";
			}
			var hideOnMap = entry[1];
			if (entry[3].replace(/ /g, '') == "") {
				var address = "";
			} else {
				var address = "<h5 class='cardAddress'>" + entry[3] + "</h5>";
			}
			if (entry[4].replace(/ /g, '') == "") {
				var dateAndTimes = "";
			} else {
				var dateAndTimes = "<h5 class='cardTimes'><span>Times:</span> " + entry[4] + "</h5>";
			}
			if (entry[5].replace(/ /g, '') == "") {
				var description = "";
			} else {
				var description = "<p class='cardDetails'><span>Details:</span> " + entry[5] + "</p>";
			}

			if (entry[7].replace(/ /g, '') == "") {
				var link = "";
			} else {
				var link = "<h5 class='cardLink'><a href='" + entry[7] + "'>More info</a></h5>";
			}
			if (entry[8].replace(/ /g, '') == "") {
				var contactInfo = "";
			} else {
				var contactInfo = "<h5 class='cardContact'><span>Contact:</span> " + entry[8] + "</h5>";
			}

			if (entry[14].replace(/ and /g, ' ') == "") {
				var type = "";
			} else {
				var type = entry[14].replace(/ and /g, ' ').toLowerCase();
			}
			var showHide = entry[16].replace(/ /g, '');
			if (entry[15].replace(/ /g, '') == "") {
				var typeMarker = "";
			} else {
				var typeMarker = entry[15];
			}
			if (entry[2].replace(/ /g, '') == "") {
				var title = "";
			} else {
				var title = entry[2];
			}
			var titleId = "";
			var entryLat = Math.round(parseFloat(latitude) * 1000) / 1000;
			var entryLon = Math.round(parseFloat(longitude) * 1000) / 1000;
			var titleId = window.location.href.split('#')[0] + '#15/' + entryLat.toString() + '/' + entryLon.toString();
			var entryHref = "";
			if (title.replace(/ /g, '') != "") {
				entryHref = "<h2 class='cardName'><a href='" + titleId + "'>" + title + "</a></h2>";
			} else {
				entryHref = "";
			}
			var feature = {
				geometry: {
					type: 'Point',
					coordinates: [parseFloat(longitude), parseFloat(latitude)]
				},
				properties: {
					"marker-color": mc,
					"marker-size": ms,
					"marker-symbol": symbol,
					"title": "<div class='" + type.replace(/drop-off/g,'dropoff').replace(/meals/g,'food').replace(/dining/g,'food').replace(/main distribution center/g, 'hub') + " region-" + region + " state-" + state + " isotope-item'>" + "<h5 class='cardType'>" + type + "<span class='stateface stateface-replace stateface-" + state.toLowerCase() + "'></span></h5>" + entryHref + address + timeStamp + description + dateAndTimes + contactInfo + link + "</div>",
					"entryHref": titleId
				}
			};
			if (showHide != '1') {
				features.push(feature);
				}
		}

		return callback(features);
	}
	var key = "AIzaSyATjmrN-_hALhmD62zhZLh4EanrmwT-mjE";
	var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT%20*%20FROM%20' + id + '&key=' + key + '&typed=false&callback=jsonp';
	$.ajax({
		url: url,
		dataType: 'jsonp',
		jsonpCallback: 'jsonp',
		success: response,
		error: response
	});
}
var map = mapbox.map('map'),
	layers = document.getElementById('layers');
map.addLayer(mapbox.layer().url('http://a.tiles.mapbox.com/v3/examples.map-9pq5k9ic,geoeye.map-amysswvq,herwig.map-6wbq68qg.jsonp').composite(false));
if (window.location.hash.length == 1) {
	if (window.location.href.split('#')[1].split('/').length == 3) {
		map.ui.hash.add();
	}
}
map.ui.zoomer.add();
map.ui.zoombox.add();
map.ui.attribution.add();
map.setZoomRange(10, 19);
if (window.location.hash.length == 0) {
	map.ui.hash.add();
	map.zoom(16).center({
		lat: 40.7065,
		lon: -74.0143
	});
}

mmg_google_docs('13OpCFyJDjWKJMqZt7kJSNmtKBX8WxShIfnbL4KU', function(features) {
	features = _.map(features, function(f) {
		// f.properties.title = f.properties.title, 
		f.properties.title = f.properties.title
		return f;
	});
	var markerLayer = mapbox.markers.layer().features(features);
	markerLayer.factory(function(m) {
		var elem = mapbox.markers.simplestyle_factory(m);
		MM.addEvent(elem, 'click', function(e) {
			map.center({
				lat: Math.round(m.geometry.coordinates[1] * 1000) / 1000,
				lon: Math.round(m.geometry.coordinates[0] * 1000) / 1000
			}).zoom(map.zoom());
		});
		return elem;
	});
	map.addLayer(markerLayer);
	mapbox.markers.interaction(markerLayer).hideOnMove(false);
	if (window.location.hash.length != "") {
		if (window.location.href.split('#')[1].split('/').length == 3) {
			var eLat = window.location.href.split('#')[1].split('/')[1]
			var eLon = window.location.href.split('#')[1].split('/')[2]
			var eZoom = window.location.href.split('#')[1].split('/')[0].split('.')[0]
			var m = markerLayer.markers()
			for (var i = 0; i < m.length; i++) {
				var entry = m[i]
				var entryLat = Math.round(entry.location.lat * 1000) / 1000;
				var entryLon = Math.round(entry.location.lon * 1000) / 1000;
				if (entryLat == eLat) {
					if (entryLon == eLon) {
						map.ui.hash.add();
						map.zoom(eZoom).center({
							lat: eLat,
							lon: eLon
						});
						entry.showTooltip();
					}
				} else {
					map.zoom(eZoom).center({
						lat: eLat,
						lon: eLon
					});
					map.ui.hash.add();
					map.zoom(eZoom).center({
						lat: eLat,
						lon: eLon
					});
					if (window.location.href.split('#')[1].replace(/\//g, "").replace(/\./g, "") == "00000") {
						map.zoom(16).center({
							lat: 40.7065,
							lon: -74.0143
						});
					}
				}
			}
		}
	}
});
