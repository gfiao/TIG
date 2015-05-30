//This variable allows us to access google maps API methods in the autocomplete feature
var google = google || {};


/*Global Variables*/

var isLoggedIn = false;
var globalmap;
var globalPrice = Number.MAX_VALUE;
//this array stores the xml constructed by xmloutdom.php
var markersXML = [];

var directionsDisplay;

//this array stores the markers as a marker object
var markers = [];
var types = [];
var cities = [];
var optimalPathPoints = [];

var newMarker = null;
var currentMarker = null;

/*
 The next functions are used to populate and control the cheapest path menu
 */
function populateTypesDropdown(parent) {
    var types = [];
    //Populates the types dropdown
    for (var i = 0; i < markers.length; i++)
        if (markers[i].city == parent && !existsIn(types, markers[i].type))
            types.push(markers[i].type);

    list(types, 'selectBegin');
    list(types, 'selectEnd');
}

//Inicializes the cheapest path drodowns menu
function initPriceModal() {
    //Populates the dropdowns with default values
    $('#selectCity').val("Lisboa");
    var city = "Lisboa";

    populateTypesDropdown(city);

    var beginType = $('#selectBeginTypes').val();
    populateBeginMarkersDropdown(beginType, city);

    var endType = $('#selectEndTypes').val();
    populateEndMarkersDropdown(endType, city);
}

//This function is called when we press the "Calcular rota" button in the cheapest path
function buildCityPriceForm() {
    if ($('#selectCity option').length == 0)
        for (var i = 0; i < cities.length; i++) {
            $('#selectCity').append($('<option>', {
                text: String(cities[i]),
                value: cities[i]
            }));
        }

    initPriceModal();
}

//Listener that checks if the uesr changes the city when building the cheapest path
function citySelectChange() {
    $('#selectCity').change(function () {
        var parent = $(this).val();
        populateTypesDropdown(parent);
    });
}

function populateBeginMarkersDropdown(type, city) {
    var names = [];
    var ids = [];
    //Popular as dropdowns dos marcadores
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].type == type && markers[i].city == city) {
            names.push(markers[i].name);
            ids.push(markers[i].id);
        }
    }
    $("#selectBeginMarkers").html("");
    $(names).each(function (i) { //populate child options
        $("#selectBeginMarkers").append('<option value="' + ids[i] + '">' + names[i] + '</option>');
    });
    $('#selectBeginMarkers').val(ids[0]);
}

function populateEndMarkersDropdown(type, city) {
    var names = [];
    var ids = [];
    //Popular as dropdowns dos marcadores
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].type == type && markers[i].city == city) {
            names.push(markers[i].name);
            ids.push(markers[i].id);
        }
    }
    $("#selectEndMarkers").html("");
    $(names).each(function (i) { //populate child options
        $("#selectEndMarkers").append('<option value="' + ids[i] + '">' + names[i] + '</option>');
    });
    $('#selectEndMarkers').val(ids[0]);
}

//Listener that checks if the user changed the "Type" dropdown and changes the corresponding markers dropdown
function selectBeginTypeChange() {
    $('#selectBeginTypes').change(function () {
        var city = $('#selectCity').val();
        var type = $(this).val();
        populateBeginMarkersDropdown(type, city);
    });
}

//Listener that checks if the user changed the "Type" dropdown and changes the corresponding markers dropdown
function selectEndTypeChange() {
    $('#selectEndTypes').change(function () {
        var city = $('#selectCity').val();
        var type = $(this).val();
        populateEndMarkersDropdown(type, city);
    });
}

function list(array_list, selectId) {
    $("#" + selectId + "Markers").html(""); //reset grandchild options id = "selectBeginMarkers"
    $("#" + selectId + "Types").html(""); //reset child options id = "selectBeginTypes"

    $(array_list).each(function (i) { //populate child options
        $("#" + selectId + "Types").append('<option value="' + array_list[i] + '">' + array_list[i] + '</option>');
    });
    $("#" + selectId + "Types").val(array_list[0]);

    if (selectId == "selectBegin")
        populateBeginMarkersDropdown(array_list[0], $('#selectCity').val());
    else
        populateEndMarkersDropdown(array_list[0], $('#selectCity').val());
}

/*
 Function that calculates the cheapest path based on a set price, an initial and end marker.
 initialID - The id of the marker where the path will start
 endID - The id of the marker where the path will end
 plafond - Max total price of all the path markers
 */
function buildPlafondPath(initialID, endID, plafond) {
    //TODO falta receber os dados como deve de ser
    if (plafond <= 0)
        plafond = Number.MAX_VALUE;
    var initialMarker, endMarker;
    for (var i = 0; i < markers.length; i++) {
        if (initialID == markers[i].id)
            initialMarker = markers[i];
        if (endID == markers[i].id)
            endMarker = markers[i];
    }
    var totalPrice = parseInt(initialMarker.price) + parseInt(endMarker.price);
    var pricePathMarkers = [];

    for (var i = 0; i < markers.length; i++) {
        var markerPrice = parseInt(markers[i].price);
        if ((totalPrice + markerPrice) > plafond)
            continue;

        if (markers[i].city == initialMarker.city && markers[i].visible) {
            pricePathMarkers.push({
                location: markers[i].position,
                stopover: true
            });
            totalPrice += markerPrice;
        }
        if (pricePathMarkers.length == 8)
            break;
    }

    calcPlafondPath(pricePathMarkers, initialMarker, endMarker);
}

/*
 Function that calculates the cheapest path using the google maps API
 pricePathMarkers - array with the middle markers
 initialMarker - marker where the path starts
 endMarker - marker where the path ends
 */
function calcPlafondPath(pricePathMarkers, initialMarker, endMarker) {
    var directionsService = new google.maps.DirectionsService();

    var waypoints = pricePathMarkers;

    var start = initialMarker;
    var end = endMarker;

    var request = {
        origin: start.position,
        destination: end.position,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.WALKING
    };

    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });

    $('#modalPricePath').modal('hide')
}

function login() {
    var form = document.getElementById("login-form");

    var username = form.elements[0].value;
    var password = form.elements[1].value;

    $.ajax({
        url: 'authenticate.php',
        type: 'post',
        data: {
            "username": username,
            "password": password
        },
        success: function (response) {
            if (response != "") {
                //If authentication is successful, show the admin interface
                createAdminInterface();
            } else
                alert("Username ou password errado!");
        }
    });
}

function createAdminInterface() {
    if (newMarker != null)
        removeNewMarker();

    //Admin is now logged in
    isLoggedIn = true;

    //Close modal
    $("#loginModal").modal("hide");

    //Hide the login button
    $("#login-button").hide();
    //Show the logout button
    $("#logout-button").show();

    //change display of the menus
    $("#newMarker, #advancedFunctions").show();
}


function logout() {
    isLoggedIn = false;

    //Show the login button
    $("#login-button").show();
    //Hide the logout button
    $("#logout-button").hide();

    //change display of the menus
    $("#newMarker, #advancedFunctions").hide();
}

/*
 Calculates the optimal path using the google maps api
 https://developers.google.com/maps/documentation/javascript/examples/directions-waypoints
 */
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

/*
 This function is called when the user clicks on the "Adicionar à lista do caminho óptimo"
 and adds the current marker to the optimalPathPoints array,
 and if the point is already in the array, the button becomes disabled
 */
function addToOptimalPath() {
    if (optimalPathPoints.length != 8) {
        if (!existsIn(optimalPathPoints, currentMarker))
            $("#optimalButton" + currentMarker.id).prop("disabled", false);

        if (!existsIn(optimalPathPoints, currentMarker)) {
            optimalPathPoints.push(currentMarker);

            $('#optimal-path').append($('<option>', {
                value: currentMarker.id,
                text: currentMarker.name
            }));
        }
        $("#optimalButton" + currentMarker.id).prop("disabled", true);
    }
}

/*
 Removes a marker from the html optimal path list
 */
function removeFromOptimalPath(optionsToRemove) {
    removeFromArray(optimalPathPoints, optionsToRemove);
    $("#optimal-path :selected").remove();
}

/*
 Function that given a set of coordinates, returns the name of the city on those coordinates.
 Uses the google maps API
 https://developers.google.com/maps/documentation/javascript/examples/geocoding-simple
 */
function reverseGeocoding(coords, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': coords}, function (results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i].types[0] === "locality") {
                        callback(results[i].address_components[0].short_name);
                        break;
                    }
                    else if (results[i].types[0] === "administrative_area_level_2") {
                        callback(results[i].address_components[0].short_name);
                        break;
                    }
                }
            } else {
                alert('No results found');
            }
        } else {
            alert('Geocoder failed due to: ' + status);
        }
    });
}

/*
 Function that given a city, returns the coordinates where that city is located and sets the center of the map
 in that location
 https://developers.google.com/maps/documentation/javascript/examples/geocoding-simple
 */
function geocoding(address, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': String(address)}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            callback(globalmap.setCenter(results[0].geometry.location));
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
    globalmap.setZoom(13);
}

/*
 Builds the insert form
 */
function buildInsertForm() {
    if ($('#select-type option').length == 0)
        for (var i = 0; i < types.length; i++) {
            $('#select-type').append($('<option>', {
                text: String(types[i]),
                value: types[i]
            }));
        }
}

/*
 Builds the update form
 */
function buildUpdateForm() {
    if ($('#select-type-update option').length == 0)
        for (var i = 0; i < types.length; i++) {
            $('#select-type-update').append($('<option>', {
                text: String(types[i]),
                value: types[i]
            }));
        }

    var form = document.getElementById("update");

    var id = form.elements[2];
    id.value = currentMarker.id;

    var name = form.elements[3];
    name.value = currentMarker.name;

    var type = form.elements[4];
    type.value = currentMarker.type;

    var opening = form.elements[6];
    opening.value = currentMarker.opening

    var closing = form.elements[7];
    closing.value = currentMarker.closing;

    var price = form.elements[8];
    price.value = currentMarker.price;

    var description = form.elements[9];
    description.value = currentMarker.description;
}

function buildCitySelect() {
    for (var i = 0; i < cities.length; i++)
        $('#city-select').append($('<option>', {
            text: String(cities[i]),
            value: cities[i]
        }));
}

/*
 Removes the newMarker from tha map, if the admin cancels the add new marker action
 */
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

/*
 Filters the markers by price
 */
function filterByPrice(price) {
    if (price <= 0)
        globalPrice = Number.MAX_VALUE;
    else
        globalPrice = price;
    if (price == "" || price <= 0) {
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

/*
 Checks if obj exists in array
 */
function existsIn(array, obj) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == obj)
            return true;
    }
    return false;
}

/*
 Removes the elements in ids from the array "array"
 */
function removeFromArray(array, ids) {
    for (var i = 0; i < array.length; i++)
        for (var j = 0; j < ids.length; j++)
            if (array[i].id == ids[j])
                array.splice(i, 1);
}

/*
 Extends the zoom to encompass all the markers
 */
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
        var newHtml = html;
        /*
         If the user is loggedIn and if the marker is not meant to be deleted, then we had
         the modify button that open up the modifiy menu where the admin can edit a marker
         */
        if (isLoggedIn && marker.icon != 'http://labs.google.com/ridefinder/images/mm_20_black.png')
            if ($("#modifyButton" + marker.id).length == 0) {
                newHtml += '<button ' +
                    'id="modifyButton"' + marker.id + ' ' +
                    'type="button" ' +
                    'class="btn btn-default infoWindowButton2" data-toggle="modal" ' +
                    'data-target="#myModal" onclick="buildUpdateForm()">Modificar' +
                    '</button>';
            }
        infoWindow.setContent(newHtml);
        infoWindow.open(map, marker);
        currentMarker = marker;
    });
}

/*
 Listener that deletes a marker when the user double clicks on it
 Only works if the admin is logged in
 */
function deleteMarker(marker, map, infoWindow, form) {
    google.maps.event.addListener(marker, 'dblclick', function () {
        if (!isLoggedIn)
            return;

        $("#del").css("display", "inline");
        marker.setIcon('http://labs.google.com/ridefinder/images/mm_20_black.png');

        var idPost = form.elements[0];
        idPost.value = marker.id;

        bindInfoWindow(marker, map, infoWindow, form);
    });
}

/*
 Loads a xml file from the website
 This function is used to import a set o points
 */
function loadXML() {
    var file = $('#xml_file').prop("files")[0].name;
    $.ajax({
        url: file,
        dataType: "xml",
        success: parseXML
    });
}

/*
 This function parses a xml file, and adds the new marker to the DB
 */
function parseXML(xml) {
    var markersXML = xml.documentElement.getElementsByTagName("marker");
    for (var i = 0; i < markersXML.length; i++) {
        var id = markersXML[i].getAttribute("id");
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

        var html = "<b>" + name + "</b> <br/>"
            + type + " <br/>";

        if (opening != null)
            html += "Abertura: " + opening + " horas<br/>";
        if (closing != null)
            html += "Fecho: " + closing + " horas";
        if (price != 0)
            html += "<br/>Preço: " + price + "€";
        if (description != "")
            html += "<br\>Descrição: " + description;

        html += '<br\><button type="button" id="optimalButton' + id + '" ' +
            'class="btn btn-default infoWindowButton2" onclick="addToOptimalPath()" deleted="deleted">' +
            'Adicionar à lista do caminho óptimo' +
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
            id: id,
            visible: true,
            map: globalmap,
            position: point,
            icon: image,
            name: name,
            type: type,
            city: city,
            opening: opening,
            closing: closing,
            price: price,
            description: description
        });
        if (existsIn(markers, marker))
            markers.push(marker);
        bindInfoWindow(marker, globalmap, infoWindow, html);
        deleteMarker(marker, globalmap, infoWindow, document.getElementById("del"));

        $.ajax({
            url: 'import.php',
            type: 'post',
            data: {
                "id": id,
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
                //alert(response);
            }
        });
    }
}

/*
 Creates a .xml file with all the points on the map
 */
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
        content: "Conteudo placeholder!Não é suposto aparecer."
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
            var city = markersXML[i].getAttribute("city");
            var opening = markersXML[i].getAttribute("opening");
            var closing = markersXML[i].getAttribute("closing");
            var point = new google.maps.LatLng(
                parseFloat(markersXML[i].getAttribute("lat")),
                parseFloat(markersXML[i].getAttribute("lng")));
            var price = markersXML[i].getAttribute("price");
            var description = markersXML[i].getAttribute("description");

            //Se não tiver descrição, definimos uma default
            if (description == "")
                description = "Este local não tem mais informações."

            var html = "<b>" + name + "</b> <br/>"
                + type;
            if (opening != "")
                html += " <br/> Abertura: " + opening + " horas<br/>";
            if (closing != "")
                html += "Fecho: " + closing + " horas";

            if (price != 0)
                html += "<br/>Preço: " + price + "€";
            html += "<br\>Descrição: " + description;

            html += '<br\><button type="button" id="optimalButton' + id + '" ' +
                'class="btn btn-default infoWindowButton" onclick="addToOptimalPath()" deleted="deleted">' +
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
                city: city,
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

        //change display of the menus
        $("#newMarker, #advancedFunctions").hide();
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
        buildCitySelect();
    });

    google.maps.event.addListener(map, 'click', function (event) {
        if (isLoggedIn)
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
    //https://stackoverflow.com/questions/26350558/hide-dynamic-google-map-markers-with-checkbox-selection (last answer)
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


    citySelectChange();
    selectBeginTypeChange();
    selectEndTypeChange();
}

google.maps.event.addDomListener(window, 'load', initialize);