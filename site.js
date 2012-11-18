function mmg_google_docs(id, callback) {
	if (typeof reqwest === 'undefined') {
		throw 'CSV: reqwest required for mmg_csv_url';
	}
	function response(x) {
		console.log(x);
		var features = [],
			latfield = '',
			lonfield = '';
		if (!x || !x.data) return features;

		for (var i = 0; i < x.data.length; i++) {			
			var entry = x.data[i];
			var symbol = "star-stroked";
			var mc = "#333";
			switch (entry['type marker']) {
			case "large_red":
				mc = "#da521f";
				break;
			case "large_green":
				// change color to green
				mc = "#22b573";
				break;
			case "large_blue":
				// change color to blue
				mc = "#0085bf";
				break;
			case "large_purple":
				// change color to purple
				mc = "#60f";
				break;
			case "dining":
				symbol = "restaurant";
				mc = "#ffcd67";
				break;
			case "rail":
				symbol = "bus";
				break;
		}
			var feature = {
				geometry: {
					type: 'Point',
					coordinates: [ parseFloat(entry['Longitude']), parseFloat(entry['Latitude']) ]
				},
				properties: {
					"marker-color": mc,
					"marker-size": "small",
					"marker-symbol": symbol,
					"title": "<h3 class='map-title'>" + entry['Title'] + "</h3>",
					"description": "<p>" + entry['Description'] + "</p>"
				}
			};			
			// if (feature.geometry.coordinates.length == 2) 
			features.push(feature);
		}

		return callback(features);
		console.log(features);
	}
	var url = 'http://ft2json.appspot.com/q?sql=SELECT%20*%20FROM%20' + id + '&limit=150&jsonp=callback';
	$.ajax({
		url: url,
		dataType: 'jsonp',
		jsonpCallback: 'callback',
		success: response,
		error: response
	});
}
var map = mapbox.map('map'),
	layers = document.getElementById('layers');
map.addLayer(mapbox.layer().url('http://a.tiles.mapbox.com/v3/herwig.map-dlouakvr,geoeye.map-amysswvq,herwig.map-qjaygbf8.jsonp').composite(true));
map.ui.hash.add();
map.ui.zoomer.add();
map.ui.zoombox.add();
map.setZoomRange(10, 19);
if (window.location.href.split('#')[1].replace(/\//g, "").replace(/\./g, "") == "00000") map.zoom(16).center({
	lat: 40.7065,
	lon: -74.0143
});

mmg_google_docs('13OpCFyJDjWKJMqZt7kJSNmtKBX8WxShIfnbL4KU', function(features) {
	features = features.map(function(f) {
		f.properties.title = f.properties.title,
		f.properties.description = f.properties.description;
		return f;
	});
	var markerLayer = mapbox.markers.layer().features(features);
	mapbox.markers.interaction(markerLayer);
	map.addLayer(markerLayer);
});