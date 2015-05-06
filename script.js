	
var markers = new Array();

function checkLegend() {


}
	
	
function downloadUrl(url,callback) {
    var request = window.ActiveXObject ?
        new ActiveXObject('Microsoft.XMLHTTP') :
        new XMLHttpRequest;

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            request.onreadystatechange = doNothing;
            callback(request, request.status);
        }
    };

    request.open('GET', url, true);
    request.send(null);
}

function doNothing() {}

function bindInfoWindow(marker, map, infoWindow, html) {
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
}


function initialize() {
    var mapOptions = {
        zoom: 16,
        center: new google.maps.LatLng(38.644711, -9.235200 )
    };

	var infoWindow = new google.maps.InfoWindow({
		content: "Diversas cenas!"
	});
	
	var form_aux = document.getElementById("mar");
	var form_del = document.getElementById("del");
	
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
		
	
	
	
	

    downloadUrl("xmloutdom.php", function(data) {
        var xml = data.responseXML;
        markers = xml.documentElement.getElementsByTagName("marker");
        for (var i = 0; i < markers.length; i++) {
            var name = markers[i].getAttribute("name");
            var type = markers[i].getAttribute("type");
            var point = new google.maps.LatLng(
                parseFloat(markers[i].getAttribute("lat")),
                parseFloat(markers[i].getAttribute("lng")));
            var html = "<b>"+name+"</b> <br/>" + type;
			
			var image = 'http://labs.google.com/ridefinder/images/mm_20_red.png';
			
			if (type == 'hotel'){
				image = 'http://labs.google.com/ridefinder/images/mm_20_red.png';
			}
			else if (type == 'restaurante'){
				image = 'http://labs.google.com/ridefinder/images/mm_20_blue.png';
			}
			else if (type == 'servicos'){
				image = 'http://labs.google.com/ridefinder/images/mm_20_green.png';
			}
			else if (type == 'transportes'){
				image = 'http://labs.google.com/ridefinder/images/mm_20_yellow.png';
			}
			else if (type == 'policia')	
				image = 'http://labs.google.com/ridefinder/images/mm_20_white.png';
			
            var marker = new google.maps.Marker({
                map: map,
                position: point,
				icon: image
            });
            bindInfoWindow(marker, map, infoWindow, html);
			
			google.maps.event.addListener(marker, 'dblclick', function(event) {
				marker.setIcon('http://labs.google.com/ridefinder/images/mm_20_black.png');
				
				var form = form_del;
		
				var namePost = form.elements[0];
				namePost.value = name;
				
				bindInfoWindow(marker, map, infoWindow, form);
				//form.submit();
		
			});
        }
    });

	google.maps.event.addListener(map, 'click', function(event) {
		var marker=new google.maps.Marker({
				position: event.latLng, 
				map: map,
				title:"New Marker"
			});
		//var form=document.getElementById("mar");
		var form = form_aux;
		
		var latf=form.elements[0];
		latf.value=event.latLng.lat();
		var lngf=form.elements[1];
		lngf.value=event.latLng.lng();
		
		bindInfoWindow(marker, map, infoWindow, form);
    });
	
	
	
}

google.maps.event.addDomListener(window, 'load', initialize);