var map = L.map('map').setView([43.66572016527307, -79.41484428761677], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// Load GeoJSON from an external file
fetch('data/Green Spaces.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data).addTo(map);
    })
    .catch(error => console.log('Error loading GeoJSON:', error));

    // Load and add the stations GeoJSON layer
    fetch('data/stations.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'icons\Subway-Icon.png', // Path to your custom icon
                        iconSize: [32, 32], // Size of the icon, adjust as needed
                        iconAnchor: [16, 32], // Anchor position of the icon, adjust as needed
                        popupAnchor: [0, -32] // Position of the popup relative to the icon
                    })
                });
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup('<h3>' + feature.properties.name + '</h3>');
                }
            }
        }).addTo(map);
    })
    .catch(error => console.log('Error loading stations GeoJSON:', error));
