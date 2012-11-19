$.sandyJSON = {
	result: "unset"
}

function mmg_google_docs(id, callback) {
	if (typeof reqwest === 'undefined') {
		throw 'CSV: reqwest required for mmg_csv_url';
	}
	var savedResponse = {};

	function response(x) {
		var features = [],
			latfield = '',
			lonfield = '';
		if (!x || !x.data) return features;
		for (var i = 0; i < x.data.length; i++) {
			var entry = x.data[i];
			if (entry['hide_on_map'] != 'yes') var symbol = "star-stroked";
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
			var entryLink = "";
			if (entry['Link'].length < 4) {
				entryLink = "";
			} else {
				entryLink = "<a href='" + entry['Link'] + "' target='_blank'>Website</a>"
			}
			var titleId = entry['Title'].replace(/[^A-Za-z0-9]/g, '-').toLowerCase();
			var feature = {
				geometry: {
					type: 'Point',
					coordinates: [parseFloat(entry['Longitude']), parseFloat(entry['Latitude'])]
				},
				properties: {
					"marker-color": mc,
					"marker-size": "small",
					"marker-symbol": symbol,
					"title": "<h3 class='map-title'>" + entry['Title'] + "</h3>",
					"description": "<ul class='map'><li class='map address'><span>Address: </span>" + entry['Address'] + "</li>" + "<li class='map desc'><span>Description: </span>" + entry['Description'] + "</li>" + "<li class='map link'><span>Link: </span>" + entryLink + "</li>" + "<li class='map dateandtime'><span>Date and Times: </span>" + entry['DateAndTimes'] + "</li>" + "<li class='map contact'><span>Contact: </span>" + entry['Contact'] + "</li>" + "<li class='map status'><span></span>" + entry['Status'] + "</li>" + "<li class='map timestamp'><span>Last Updated: </span>" + entry['Timestamp'] + "</li></ul>" + "<div class='navId hidden' id ='" + titleId + "'></div",
					"entryHref": titleId
				}
			};
			features.push(feature);
		}
		$.sandyJSON.result = features

		return callback(features);
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
if (window.location.hash.length == 1) {
	if (window.location.href.split('#')[1].split('/').length == 3) {
		map.ui.hash.add();
	}
}
map.ui.zoomer.add();
map.ui.zoombox.add();
map.ui.attribution.add();
map.setZoomRange(10, 19);
if (window.location.hash.length == 1) {
	if (window.location.href.split('#')[1].split('/').length == 3) {
		if (window.location.href.split('#')[1].replace(/\//g, "").replace(/\./g, "") == "00000") {
			map.zoom(16).center({
				lat: 40.7065,
				lon: -74.0143
			});
		}
	}
}
if (window.location.hash.length == 0) {
	map.ui.hash.add();
	map.zoom(16).center({
		lat: 40.7065,
		lon: -74.0143
	});

}


mmg_google_docs('13OpCFyJDjWKJMqZt7kJSNmtKBX8WxShIfnbL4KU', function(features) {
	features = features.map(function(f) {
		f.properties.title = f.properties.title, f.properties.description = f.properties.description, f.properties.link = f.properties.link;
		return f;
	});
	var markerLayer = mapbox.markers.layer().features(features);
	markerLayer.factory(function(m) {
		var elem = mapbox.markers.simplestyle_factory(m);
		MM.addEvent(elem, 'click', function(e) {
			map.ui.hash.remove()
			map.ease.location({
				lat: m.geometry.coordinates[1],
				lon: m.geometry.coordinates[0]
			}).zoom(map.zoom());
			map.center({
				lat: m.geometry.coordinates[1],
				lon: m.geometry.coordinates[0]
			});
			window.location.hash = m.properties.entryHref
		});
		return elem;
	});
	map.addLayer(markerLayer);
	mapbox.markers.interaction(markerLayer).hideOnMove(false);
	var m = $.sandyJSON.result
	if (window.location.href.split('#').length == 2) {
		if (window.location.href.split('#')[1].split('/').length = 1) {
			map.ui.hash.remove()
			var hash = window.location.href.split('#')[1]
			for (var i = 0; i < m.length; i++) {
				var entry = m[i]
				if (hash == entry.properties['entryHref']) {
					map.zoom(14).center({
						lat: entry.geometry.coordinates[1],
						lon: entry.geometry.coordinates[0]
					});
					var ix = m.indexOf(entry)
				}
			}
		}
	}

});
