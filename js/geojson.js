/* Main.js Carlos M. Crespo */

//function to instantiate the Leaflet map
function createMap() {
    //create the map
    var map = L.map('map', {
        center: [36, -76],
        zoom: 4.22
    });

    //add OSM base tilelayer
   L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   attribution: 'Data: U.S. Coast Guard</a>, Design - Carlos M. Crespo, 2018; Map: <a href="http://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>'
   }).addTo(map);

   //call getData function
   getData(map);
};

//Add circle markers for point features to the map
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
        
    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.4
    };
            
    //for each feature, determine its value for the selected attribute value
    var attValue = Number(feature.properties[attribute]);
            
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    
    //create new popup
    var popup = new Popup(feature.properties, attribute, layer, options.radius);
    
    //add popup to circle marker
    popup.bindToLayer();
    
    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },        
    });        
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
}

  //calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
        //scale factor to adjust symbol size evenly
    var scaleFactor = 3;
        //area based on atrribute value and scale factor
    var area = attValue * scaleFactor;
        //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
        
    return radius;
};

//add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
}      

//create new sequence controls
function createSequenceControls(map, attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        onAdd: function (map) {
            //create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
            
            $(container).append('<input class="range-slider" type="range">');
            
            //add skip buttons
            $(container).append('<button class="skip" id="back" title="Back">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
            
            //kill any mouse event listerner on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            
            return container;
        }
        
    });
    
    //add sequence-controls to map
    map.addControl(new SequenceControl());
    
    //set slider attributes
    $('.range-slider').attr({
        max: 10,
        min: 0,
        value: 0,
        step: 1
    });
    
    createLegend(map, attributes);
    updateLegend(map, attributes[0]);
    
    //replace button content with images
    $('#back').html('<img src="img/back.png">');
    $('#forward').html('<img src="img/forward.png">');
    
    //click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        
        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first
            index = index > 10 ? 0 : index;
        } else if ($(this).attr('id') == 'back'){
            index--;
            //if past the first attribute, wrap around to last
            index = index < 0 ? 10 : index;
        };
        
        //update slider
        $('.range-slider').val(index);
        
        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[index]);
        
        });
    
    //input listener for slider
    $('.range-slider').on('input', function(){
        //get new index value
        var index = $(this).val();
        
        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[index]);
    });
}

function processData(data){
    //empty array to hold attributes
    var attributes = [];
    
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    
    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with SAR cases values
        if (attribute.indexOf("") > -1){
            attributes.push(attribute);
        };
    };
        
    return attributes;
};

//resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute, updateLegend){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            
            //update each feature's radius based on new attribute value
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            
            //create new popup
            var popup = new Popup(props, attribute, layer, radius);
            
            //add popup to circle marker
            popup.bindToLayer();            
        };
    });
};

//Popup constructor function
function Popup(properties, attribute, layer, radius){
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
    this.year = attribute;
    this.cases = this.properties[attribute];
    this.content = "<p><b>Captain of the Port zone:</b> " + this.properties.COTP + "</p><p><b>Search and Rescue cases in " + this.year + ":</b> " + this.cases + "</p>";

    this.bindToLayer = function(){
        this.layer.bindPopup(this.content, {
            offset: new L.Point(0,-radius)
        });
    };
};

function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>Captain of the Port Zone:</b> " + properties.COTP + "</p>";
    
    //add formatted attribute panel content string
    var year = attribute;
    popupContent += "<p><b>Search and Rescue cases in " + year + ":</b> " + properties[attribute] + "</p>";
    
    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};

function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        
        onAdd: function(map) {
            //crete the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            
            //add temporal legend div to legend container
            $(container).append('<div id="temporal-legend">')
            
            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="260px" height="260px">';
            
            //array of circle names to base loop
            var circles = {
                max: 45,
                mean: 70,
                min: 95
            };
            
            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#F47811" fill-opacity=0.4" stroke="#000000" cx="60"/>';
                        
                //text string
                svg += '<text id="' + circle + '-text" x="110" y="' + circles[circle] + '"></text>';
            };
            
            //close svg string
            svg += "</svg>";
            
            //add attribute legend svg to legend container
            $(container).append(svg);
            
            return container;
        }
    });
    //add legend
    map.addControl(new LegendControl());
    updateLegend(map, attributes[0]);
    
};

//update the legend with new attribute
function updateLegend (map, attributes){
    //create content for legend
    var year = attributes;
    var content = "<p><b>Search and Rescue Cases in " + year + "</b>\<p>(Maximum, average and minimum number of cases)</p>";
    
    //replace legend content
    $('#temporal-legend').html(content);
    
    //get the max, mean & min values as an object
    var circleValues = getCircleValues(map, attributes);
    
    for (var key in circleValues){
        //get radius
        var radius = calcPropRadius(circleValues[key]);
        
        $('#'+key).attr({
            cy: 100 - radius,
            r: radius
        });
        
        //add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " cases");
    };
};

//calculate the max, mean, & min values for a given attribute
function getCircleValues(map, attributes){
    //start with the min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;
    
    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attributes]);
            
            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };
            
            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });
    
    // set mean
    var mean = (max + min) / 2;
    
    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//create symbology for polygon symbols
function createBoundarySymbols(data, map, boundary){
    L.geoJson(data, {
        });
    
    //assign symbology values for polygons 
    var cotpZones = L.geoJson(data, {
        fillColor: "red",
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.15,
        interactive: false        
    });
    //assign polygon layer to overlay variable
    var boundaries = {
        "<span style='color: darkred'>Turn on Captain of the Port Boundaries": cotpZones
    };
    
    //control for COTP zones boundaries
    L.control.layers(null, boundaries,{collapsed:false}).addTo(map);

    return map
};

//function to retrieve the data and place it on the map
function getData(map){
    //load polygon geoJSON
    $.ajax("data/sectorBoundaries.geojson", {
        dataType: "json",
        success: function(response){

            var boundary = [];
            createBoundarySymbols(response, map, boundary);
        }
    });
    
    //load the data
    $.ajax("data/sarCases.geojson", {
        dataType: "json",
        success: function (response) {
            var attributes = processData(response);
            
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);  
            createSequenceControls(map, attributes);             
        }
    });        
};

$(document).ready(createMap);
