//Leaflet Demo Recording

var map = L.map('map',{
    center: [45, -98],
    zoom: 8,
    minZoom: 3,
    maxZoom: 14,
    zoomControl: false
})

var spiderbee = L.tileLayer('https://api.mapbox.com/styles/v1/ccrespo/cjdfcw1yz5p9x2rp77bt9awni/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2NyZXNwbyIsImEiOiJjaXNkd3lzdTQwMDd4Mnl2b3V2cTBmbnUzIn0.d7wSdKZ3KwqoXSGAByFYrw',{
    attribution: "Thank you, Mapbox",
    minZoom: 3,
    maxZoom: 14    
}).addTo(map);

var place = L.marker([45, -97]).addTo(map);

var zone = L.circle([44, -94],{
    color: 'red',
    fillcolor: 'red',
    opacity: .75,
    radius: 5000
}).addTo(map);

var area = L.polygon([[44,-93],[43, -94],[43, -89]],{
    color: 'red',
    fillcolor: 'red',
    opacity: 1
    
}).addTo(map);

place.bindPopup("<h1>Hello!</h>");

area.bindPopup("<em>hi there</em>");

zone.bindPopup("<p>I'm a square</p>");
