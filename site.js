function mmg_google_docs(id, callback) {
	if (typeof reqwest === 'undefined') {
		throw 'CSV: reqwest required for mmg_csv_url';
	}

	function response(x) {
		var features = [],
			latfield = '',
			lonfield = '';
		if (!x || !x.feed) return features;

		for (var f in x.feed.entry[0]) {
			if (f.match(/\$Lat/i)) latfield = f;
			if (f.match(/\$Lon/i)) lonfield = f;
		}

		for (var i = 0; i < x.feed.entry.length; i++) {
			var entry = x.feed.entry[i];
			var feature = {
				geometry: {
					type: 'Point',
					coordinates: []
				},
				properties: {
					"marker-color": "#da521f",
					"marker-size": "small",
					"marker-symbol": "star-stroked",
					"title": '<h3>' + entry['title'] + '</h3>',
					"description":  '<p>' + entry['description'] + '</p>'
				}
			};
			for (var y in entry) {
				if (y === latfield) feature.geometry.coordinates[1] = parseFloat(entry[y].$t);
				else if (y === lonfield) feature.geometry.coordinates[0] = parseFloat(entry[y].$t);
				else if (y.indexOf('gsx$') === 0) {
					feature.properties[y.replace('gsx$', '')] = entry[y].$t;
				}
			}
			if (feature.geometry.coordinates.length == 2) features.push(feature);
		}

		return callback(features);
	}

	var url = 'https://spreadsheets.google.com/feeds/list/' + id + '/1/public/values?alt=json-in-script&callback=callback';

	reqwest({
		url: url,
		type: 'jsonp',
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

mmg_google_docs('0AhK1LcvMqvlJdHhQbkFhaVBOQlRPVTZFdy1LS2hRcUE', function(features) {
 features = features.map(function(f) {
		f.properties.title = f.properties.title,
	    f.properties.description = f.properties.description;
		return f;
	});

	var markerLayer = mapbox.markers.layer().features(features);
	mapbox.markers.interaction(markerLayer);
	map.addLayer(markerLayer);
});
