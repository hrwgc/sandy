function mmg_google_docs(id, callback) {
   if (typeof reqwest === 'undefined') {
      throw 'CSV: reqwest required for mmg_csv_url';
   }

   function response(x) {
    console.log(x);

 
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
		var status = entry[6];
		var link = entry[7];
		var contactInfo = entry[8];
		var region = entry[9];
		var state = entry[10];
		var latitude = entry[11];
		var longitude = entry[12];
		var ignoreTimestamp = entry[13];
		var type = entry[14];
		var typeMarker = entry[15];
		var showHide = entry[16];
		var defaultUrgent = entry[17];
         var symbol = "star-stroked";
         var mc = "#777";
         var ms = "small";
         switch (typeMarker) {
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
            ms = "medium";
            mc = "#ffcc00"
            break;
         }
         var entryLink = "";
         if (link.length < 4) {
            entryLink = "";
         } else {
            link = "<a href='" + entry['Link'] + "' target='_blank'>Website</a>"
         }
         var titleId = "";
         var entryLat = Math.round(parseFloat(latitude) * 1000) / 1000;
         var entryLon = Math.round(parseFloat(longitude) * 1000) / 1000;
         var titleId = window.location.href.split('#')[0] + '#15/' + entryLat.toString() + '/' + entryLon.toString();
         var entryHref = "<h3 class='map-title'><a href='" + titleId + "'>" + title + "</a></h3>";
         var feature = {
            geometry: {
               type: 'Point',
               coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            properties: {
               "marker-color": mc,
               "marker-size": ms,
               "marker-symbol": symbol,
               "title": entryHref,
               "description": "<ul class='map'><li class='map address'><span>Address: </span>" + address + "</li>" + "<li class='map desc'><span>Description: </span>" + description + "</li>" + "<li class='map link'><span>Link: </span>" + entryLink + "</li>" + "<li class='map dateandtime'><span>Date and Times: </span>" + dateAndTimes + "</li>" + "<li class='map contact'><span>Contact: </span>" + contactInfo + "</li>" + "<li class='map status'><span></span>" + status + "</li>" + "<li class='map timestamp'><span>Last Updated: </span>" + timeStamp + "</li></ul>" + "<div class='navId hidden' id ='" + titleId + "'></div",
               "entryHref": titleId
            }
         };
         if (showHide != '1')  {
         features.push(feature);
        }
//		$('.grid').append("<div class='col-1-3'>" + title + "</div>")

      }
      return callback(features);
   }
   var key = "AIzaSyATjmrN-_hALhmD62zhZLh4EanrmwT-mjE"
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
map.addLayer(mapbox.layer().url('http://a.tiles.mapbox.com/v3/examples.map-9pq5k9ic,geoeye.map-amysswvq,herwig.map-6wbq68qg.jsonp').composite(true));
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
      f.properties.title = f.properties.title, f.properties.description = f.properties.description, f.properties.link = f.properties.link;
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