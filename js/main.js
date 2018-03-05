/* Example from Leaflet Quick Start Guide*/
//L.map instantiates a map object given the DOM ID of a <div> element and optionally an object literal with Map options.
var map = L.map('map').setView([36, -76], 4);

//add tile layer...Instantiates a tile layer object given a URL template and optionally an options object.
L.tileLayer('https://api.mapbox.com/styles/v1/ccrespo/cjdfcw1yz5p9x2rp77bt9awni/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2NyZXNwbyIsImEiOiJjaXNkd3lzdTQwMDd4Mnl2b3V2cTBmbnUzIn0.d7wSdKZ3KwqoXSGAByFYrw', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery   <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'username.ab12cdef',
    accessToken: 'ab.cdE1Fghijk2lmNopQR3stUv4WX5YZabcDEF6GhiJK7L8M9NopQ.rsTuVWxyZABCDEFghiJKlm'
}).addTo(map);

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);