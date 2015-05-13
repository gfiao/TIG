var google = google || {};

var globalmap;

//this array stores the xml constructed by xmloutdom.php
var markersXML = new Array();

//this array stores the markers as a marker object
var markers = new Array();
var geocoder = new google.maps.Geocoder();

var types = new Array();

var newMarker = null;

var formInsert = '<input type="text" name="lat" value="" style="display: none"/>' +
    '<input type="text" name="lng" value="" style="display: none"/>' +
    'Nome: <input type="text" class="form-control" name="name" value=""/>' +
        //'Tipo: <input type="text" class="form-control" name="type" value=""/>' +
    'Tipo: <select id="select-type" class="form-control"> </select>' +
    '<input type="text" name="city" value="" style="display: none"/>' +
    'Abertura: <input type="text" class="form-control" name="opening" value=""/>' +
    'Fecho: <input type="text" class="form-control" name="closing" value=""/>' +
    'Preço: <input type="text" class="form-control" name="price" value=""/>' +
    'Descrição: <input type="text" class="form-control" name="description" value=""/>' +
    '<input type="submit" class="btn btn-default"/>' +
    '<input type="button" value="Cancelar" class="btn btn-default" onclick="removeNewMarker();checkNewMarker()"/></form>';


function buildInsertForm() {
    console.log(types);
    for (var i = 0; i < types.length; i++) {
        $('#select-type').append($('<option>', {
            text: String(types[i]),
            value: types[i]
        }));
    }
}

//checks if newMarker is null or not
//to be called in the html
function removeNewMarker() {
    newMarker.setMap(null);
    newMarker = null;
}

function checkNewMarker() {
    if (newMarker == null) {
        $("#insert").html("<p>Escolha um local no mapa para inserir.</p>");
    }
    else {
        $("#insert").html(formInsert);
        buildInsertForm();
    }
}

function filterByPrice(price) {
    if (price == "" || price == 0) {
        for (var i = 0; i < markers.length; i++) {
            if ($('#' + markers[i].type).is(':checked'))
                markers[i].setVisible(true);
        }
    }
    else {
        for (var i = 0; i < markers.length; i++)
            if (parseInt(markers[i].price) <= price)
                markers[i].setVisible(true);
            else
                markers[i].setVisible(false);
    }
}

function panToCity(city) {
    geocoder.geocode({'address': String(city)}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            globalmap.setCenter(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function addMarkersToHTML() {
    $.each(markers, function (i, marker) {
        $('#optimal-path').append($('<option>', {
            text: marker.name
        }));
    });
}

function fullextent() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].visible)
            bounds.extend(markers[i].position);
    }

    globalmap.fitBounds(bounds);

}

function downloadUrl(url, callback) {
    var request = window.ActiveXObject ?
        new ActiveXObject('Microsoft.XMLHTTP') :
        new XMLHttpRequest;

    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            request.onreadystatechange = doNothing;
            callback(request, request.status);
        }
    };

    request.open('GET', url, true);
    request.send(null);
}

function doNothing() {
}

function bindInfoWindow(marker, map, infoWindow, html) {
    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
}

function deleteMarker(marker, map, infoWindow, form) {
    google.maps.event.addListener(marker, 'dblclick', function (event) {
        marker.setIcon('http://labs.google.com/ridefinder/images/mm_20_black.png');

        var namePost = form.elements[0];
        namePost.value = marker.name;

        bindInfoWindow(marker, map, infoWindow, form);
        //form.submit();
    });
}


function initialize() {
    var mapOptions = {
        streetViewControl: false,
        zoomControl: false,
        panControl: false,
        zoom: 14,
        center: new google.maps.LatLng(38.722531, -9.140249)
    };

    var infoWindow = new google.maps.InfoWindow({
        content: "Diversas cenas!"
    });

    var form = document.getElementById("del");

    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);

    downloadUrl("xmloutdom.php", function (data) {
        var xml = data.responseXML;
        markersXML = xml.documentElement.getElementsByTagName("marker");
        for (var i = 0; i < markersXML.length; i++) {
            var name = markersXML[i].getAttribute("name");
            var type = markersXML[i].getAttribute("type");
            var opening = markersXML[i].getAttribute("opening");
            var closing = markersXML[i].getAttribute("closing");
            var point = new google.maps.LatLng(
                parseFloat(markersXML[i].getAttribute("lat")),
                parseFloat(markersXML[i].getAttribute("lng")));
            var html = "<b>" + name + "</b> <br/>" + type + " <br/>Abertura: " + opening
                + " horas<br/>Fecho: " + closing + " horas";

            var image = 'http://labs.google.com/ridefinder/images/mm_20_red.png';

            if (type == 'Hotel') {
                image = 'http://labs.google.com/ridefinder/images/mm_20_red.png';
            }
            else if (type == 'Restaurante') {
                image = 'http://labs.google.com/ridefinder/images/mm_20_blue.png';
            }
            else if (type == 'Hostel') {
                image = 'http://labs.google.com/ridefinder/images/mm_20_green.png';
            }
            else if (type == 'Monumento') {
                image = 'http://labs.google.com/ridefinder/images/mm_20_yellow.png';
            }
            else if (type == 'Museu')
                image = 'http://labs.google.com/ridefinder/images/mm_20_white.png';

            var marker = new google.maps.Marker({
                visible: true,
                map: map,
                position: point,
                icon: image,
                name: markersXML[i].getAttribute("name"),
                type: markersXML[i].getAttribute("type"),
                price: markersXML[i].getAttribute("price")
            });
            globalmap = map;
            markers.push(marker);
            bindInfoWindow(marker, map, infoWindow, html);
            deleteMarker(marker, map, infoWindow, form);
        }
        addMarkersToHTML();
    });

    downloadUrl("xmltypes.php", function (data) {
        var xml = data.responseXML;
        var typesXML = xml.documentElement.getElementsByTagName("type");
        for (var i = 0; i < typesXML.length; i++) {
            types.push(typesXML[i].getAttribute("type"));
        }
    });

    google.maps.event.addListener(map, 'click', function (event) {
        //buildInsertForm();
        //$("#insert").html(formInsert);
        if (newMarker == null) {
            newMarker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                title: "New Marker"
            });
        }
        else {
            newMarker.setMap(null);
            newMarker.position = event.latLng;
            newMarker.setMap(map);
        }

        //TODO: corrigir localidade
        var city;
        geocoder.geocode({'latLng': latlng}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    city = results[1].formatted_address.split(",")[0];
                } else {
                    alert('No results found');
                }
            } else {
                alert('Geocoder failed due to: ' + status);
            }
        });

        console.log(document.getElementById("insert"));

        var form = document.getElementById("insert");

        var latf = form.elements[0];
        latf.value = event.latLng.lat();
        var lngf = form.elements[1];
        lngf.value = event.latLng.lng();
        var formCity = form.elements[4];
        formCity.value = city;

        var latlng = new google.maps.LatLng(latf.value, lngf.value);


        bindInfoWindow(newMarker, map, infoWindow, form);
    });

    //filters for the types of interest points
    $(":checkbox").change(function toggleGroup() {
        var id = this.id;
        if ($('#' + id).is(':checked')) {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].type == id)
                    markers[i].setVisible(true);
            }
        }
        else {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].type == id)
                    markers[i].setVisible(false);
            }
        }
    });

}

google.maps.event.addDomListener(window, 'load', initialize);