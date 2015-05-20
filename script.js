var google = google || {};

var globalmap;
var globalPrice = Number.MAX_VALUE;
//this array stores the xml constructed by xmloutdom.php
var markersXML = [];

//this array stores the markers as a marker object
var markers = [];
//var geocoder = new google.maps.Geocoder();
//var directionsService = new google.maps.DirectionsService();
var directionsDisplay;

var types = [];

var cities = [];

var optimalPathPoints = [];

var newMarker = null;

var currentMarker = null;

function calcOptimalPath() {
    var directionsService = new google.maps.DirectionsService();

    var waypoints = optimalPathPoints;

    var start = waypoints[0];
    var end = waypoints[waypoints.length - 1];

    var readyWaypoints = [];
    for (var i = 1; i < waypoints.length - 1; i++) {
        readyWaypoints.push({
            location: waypoints[i].position,
            stopover: true
        });
    }

    var request = {
        origin: start.position,
        destination: end.position,
        waypoints: readyWaypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.WALKING
    };

    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
}

function addToOptimalPath() {
    if (optimalPathPoints.length != 8) {
        if (!existsIn(optimalPathPoints, currentMarker))
            $("#optimalButton" + currentMarker.id).prop("disabled", false);

        console.log("clickei neste socio! " + currentMarker.id);

        if (!existsIn(optimalPathPoints, currentMarker)) {
            optimalPathPoints.push(currentMarker);

            $('#optimal-path').append($('<option>', {
                value: currentMarker.id,
                text: currentMarker.name
            }));
        }

        console.log(optimalPathPoints);


        $("#optimalButton" + currentMarker.id).prop("disabled", true);
    }
}

function removeFromOptimalPath(optionsToRemove) {
    console.log(optionsToRemove);
    removeFromArray(optimalPathPoints, optionsToRemove);
    $("#optimal-path :selected").remove();
    console.log(optimalPathPoints);
}

function reverseGeocoding(coords, callback) {
    var geocoder = new google.maps.Geocoder();
    //TODO: corrigir localidade
    geocoder.geocode({'latLng': coords}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                console.log(results);
                callback(results[1].formatted_address.split(",")[0]);
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}

function geocoding(adress, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': String(adress)}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            callback(globalmap.setCenter(results[0].geometry.location));
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function buildInsertForm() {
    if ($('#select-type option').length == 0)
        for (var i = 0; i < types.length; i++) {
            $('#select-type').append($('<option>', {
                text: String(types[i]),
                value: types[i]
            }));
        }
}

function buildUpdateForm() {
    if ($('#select-type-update option').length == 0)
        for (var i = 0; i < types.length; i++) {
            $('#select-type-update').append($('<option>', {
                text: String(types[i]),
                value: types[i]
            }));
        }

    var form = document.getElementById("update");

    var name = form.elements[2];
    name.value = currentMarker.name;

    var type = form.elements[3];
    type.value = currentMarker.type;

    var opening = form.elements[5];
    opening.value = currentMarker.opening

    var closing = form.elements[6];
    closing.value = currentMarker.closing;

    var price = form.elements[7];
    price.value = currentMarker.price;

    var description = form.elements[8];
    description.value = currentMarker.description;
}

function buildCitySelect() {
    for (var i = 0; i < cities.length; i++) {
        $('#city-select').append($('<option>', {
            text: String(cities[i]),
            value: cities[i]
        }));
    }
}

//checks if newMarker is null or not
//to be called in the html
function removeNewMarker() {
    newMarker.setMap(null);
    newMarker = null;
    checkNewMarker();
}

function checkNewMarker() {
    if (newMarker == null) {
        $("#insert").css("display", "none");
        $("#noMarkerMsg").css("display", "inline");
    }
    else {
        $("#noMarkerMsg").css("display", "none");
        $("#insert").css("display", "inline");
        buildInsertForm();
    }
}

function filterByPrice(price) {
    if (price == 0)
        globalPrice = Number.MAX_VALUE;
    else
        globalPrice = price;
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

function existsIn(array, obj) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == obj)
            return true;
    }
    return false;
}

function removeFromArray(array, ids) {
    for (var i = 0; i < array.length; i++)
        for (var j = 0; j < ids.length; j++)
            if (array[i].id == ids[j])
                array.splice(i, 1);
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
        currentMarker = marker;
    });
}

function deleteMarker(marker, map, infoWindow, form) {
    google.maps.event.addListener(marker, 'dblclick', function () {
        $("#del").css("display", "inline");
        marker.setIcon('http://labs.google.com/ridefinder/images/mm_20_black.png');

        var namePost = form.elements[0];
        namePost.value = marker.name;

        bindInfoWindow(marker, map, infoWindow, form);
    });
}

function loadXML() {

    var file = $('#xml_file').prop("files")[0].name;

    $.ajax({
        url: file,
        dataType: "xml",
        success: parseXML
    });
}

function parseXML(xml) {
    console.log(xml);
    var markersXML = xml.documentElement.getElementsByTagName("marker");
    for (var i = 0; i < markersXML.length; i++) {
        var city = markersXML[i].getAttribute("city");
        var name = markersXML[i].getAttribute("name");
        var type = markersXML[i].getAttribute("type");
        var opening = markersXML[i].getAttribute("opening");
        var closing = markersXML[i].getAttribute("closing");
        var point = new google.maps.LatLng(
            parseFloat(markersXML[i].getAttribute("lat")),
            parseFloat(markersXML[i].getAttribute("lng")));
        var price = markersXML[i].getAttribute("price");
        var description = markersXML[i].getAttribute("description");

        var html = "<b>" + name + "</b> <br/>" + type + " <br/>Abertura: " + opening
            + " horas<br/>Fecho: " + closing + " horas";
        if (price != 0)
            html += "<br/>Preço: " + price + "€";
        if (description != "")
            html += "<br\>Descrição: " + description;
        html += '<br\>' +
            '<button type="button" class="btn btn-default" data-toggle="modal" ' +
            'data-target="#myModal" onclick="buildUpdateForm()">' +
            'Modificar' +
            '</button>';

        var infoWindow = new google.maps.InfoWindow({
            content: "Diversas cenas!"
        });

        var image = 'http://labs.google.com/ridefinder/images/mm_20_purple.png';

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
            map: globalmap,
            position: point,
            icon: image,
            name: name,
            type: type,
            opening: opening,
            closing: closing,
            price: price,
            description: description
        });
        markers.push(marker);
        bindInfoWindow(marker, globalmap, infoWindow, html);
        deleteMarker(marker, globalmap, infoWindow, document.getElementById("del"));

        $.ajax({
            url: 'insert.php',
            type: 'post',
            data: {
                "type": type,
                "city": city,
                "name": name,
                "lat": point.lat(),
                "lng": point.lng(),
                "price": price,
                "opening": opening,
                "closing": closing,
                "description": description
            },
            success: function (response) {
                alert(response);
            }
        });
    }
}

function backup() {
    $.ajax({
        url: 'xmlbackup.php',
        type: 'post',
        success: function () {
            alert("Backup feito!");
        }
    });
}


function initialize() {
    var mapOptions = {
        streetViewControl: false,
        zoomControl: false,
        panControl: false,
        zoom: 14,
        //Lisboa
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
            var id = markersXML[i].getAttribute("id");
            var name = markersXML[i].getAttribute("name");
            var type = markersXML[i].getAttribute("type");
            var opening = markersXML[i].getAttribute("opening");
            var closing = markersXML[i].getAttribute("closing");
            var point = new google.maps.LatLng(
                parseFloat(markersXML[i].getAttribute("lat")),
                parseFloat(markersXML[i].getAttribute("lng")));
            var price = markersXML[i].getAttribute("price");
            var description = markersXML[i].getAttribute("description");

            var html = "<b>" + name + "</b> <br/>" + type + " <br/>Abertura: " + opening
                + " horas<br/>Fecho: " + closing + " horas";
            if (price != 0)
                html += "<br/>Preço: " + price + "€";
            if (description != "")
                html += "<br\>Descrição: " + description;
            html += '<br\>' +
                '<button type="button" class="btn btn-default" data-toggle="modal" ' +
                'data-target="#myModal" onclick="buildUpdateForm()">' +
                'Modificar' +
                '</button>';

            html += '<br\>' +
                '<button type="button" id="optimalButton' + id + '" ' +
                'class="btn btn-default" onclick="addToOptimalPath()" deleted="deleted">' +
                'Adicionar à lista do caminho óptimo' +
                '</button>';

            var image = 'http://labs.google.com/ridefinder/images/mm_20_purple.png';

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
                id: id,
                name: name,
                type: type,
                opening: opening,
                closing: closing,
                price: price,
                description: description
            });
            directionsDisplay = new google.maps.DirectionsRenderer();
            directionsDisplay.setMap(map);
            globalmap = map;
            markers.push(marker);
            bindInfoWindow(marker, map, infoWindow, html);
            deleteMarker(marker, map, infoWindow, form);
        }
        buildCitySelect();
    });

    downloadUrl("xmltypes.php", function (data) {
        var xml = data.responseXML;
        var typesXML = xml.documentElement.getElementsByTagName("type");
        for (var i = 0; i < typesXML.length; i++) {
            types.push(typesXML[i].getAttribute("type"));
        }
    });

    downloadUrl("xmlcities.php", function (data) {
        var xml = data.responseXML;
        var citiesXML = xml.documentElement.getElementsByTagName("city");
        for (var i = 0; i < citiesXML.length; i++) {
            cities.push(citiesXML[i].getAttribute("city"));
        }
    });

    google.maps.event.addListener(map, 'click', function (event) {
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
        checkNewMarker();

        var form = document.getElementById("insert");

        var latf = form.elements[0];
        latf.value = event.latLng.lat();
        var lngf = form.elements[1];
        lngf.value = event.latLng.lng();
        var formCity = form.elements[4];

        reverseGeocoding(newMarker.position, function (result) {
            formCity.value = result;
        })
    });

    //filters for the types of interest points
    $(":checkbox").change(function toggleGroup() {
        var id = this.id;
        if ($('#' + id).is(':checked')) {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].type == id && markers[i].price <= globalPrice)
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