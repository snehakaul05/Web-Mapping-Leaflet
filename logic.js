// Create the map object with options
var myMap = L.map("map",{
    center: [39.8283, -98.5795],
    zoom: 5,
});

// Link to GeoJSON
var url= "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Adding tile layer
var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?acces_token={accessToken}", {
    accessToken, API_KEY}).addTo(myMap);

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    accessToken, API_KEY}).addTo(myMap);

var lightscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    accessToken, API_KEY}).addTo(myMap);


// Creating a geoJSON layer with the retrieved data
var earthquakes = new L.layerGroup();
var plates = new L.layerGroup();

//Create overlay object to hold our overlay layer
var overlayMaps = { 
    Earthquakes: earthquakes,
    Plates: plates
};

//Define a baseMap object to hold the base layer
var baseMaps = {
    "Street Map": streetmap,
    "Grey Scale": satellite,
    "Light Scale": lightscale
    };

//Create a layer control 
L.control.layers(baseMaps,overlayMaps).addTo(myMap);

// Perform a GET request to the query URL
d3.json(url, function(data){

    function styleData(feature){
        return {
            fillColor: getColor(feature.properties.mag),
            radius: getRadius(feature.properties.mag),
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        };
    }

    function getColor(magnitude) {
        return magnitude > 5  ? '#800026' :
        magnitude > 4  ? '#BD0026' :
        magnitude > 3  ? '#E31A1C' :
        magnitude > 2  ? '#FC4E2A' :
        magnitude > 1  ? '#FD8D3C' :
        magnitude > 0  ? '#FEB24C' :'#FFEDA0';
    }

    function getRadius(magnitude) {  
         if (magnitude > 5) return 25
         else if (magnitude > 4) return 20
         else if (magnitude > 3) return 15
         else if (magnitude > 2) return 10
         else if (magnitude > 1) return 5
         else return 1
    }

   function  pointToLayer(feature, latlng) {
        return new L.CircleMarker(latlng, styleData(feature)) 
    }

   function onEachFeature(feature, layer){
        layer.bindPopup("<h3>"+ feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p> Magnitude: " + feature.properties.mag + "</p>");
    }

    L.geoJson(data, {pointToLayer: pointToLayer, onEachFeature: onEachFeature, style: styleData, color:getColor}).addTo(earthquakes);

    // Perform a GET request to the query URL
    d3.json(plates_url, function(data){
         L.geoJson(data, {
            color: "orange",
            weight: 2
        }).addTo(plates);

        plates.addTo(myMap)
    })

    earthquakes.addTo(myMap)

    // Setting up the legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (myMap) {

        var div = L.DomUtil.create('div', 'info legend');

        categories = ['0 - 1','1 - 2','2 - 3','3 - 4','5 +'];
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML +=
            '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
             (categories[i] ? categories[i] + '<br>' : '+');
        }

        return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);
})