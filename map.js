var map = L.map('map').setView([43.66572016527307, -79.41484428761677], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let greenSpacesLayer, stationsLayer;

// Load GeoJSON from an external file
fetch('data/Green Spaces.geojson')
    .then(response => response.json())
    .then(data => {
        greenSpacesLayer = L.geoJSON(data).addTo(map);
    })
    .catch(error => console.log('Error loading GeoJSON:', error));

    // Load and add the stations GeoJSON layer
    fetch('data/stations.geojson')
    .then(response => response.json())
    .then(stationsData => {
        stationsLayer = L.geoJSON(stationsData, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'icons/Subway-Icon.png',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32]
                    })
                });
            }
        }).addTo(map);

        // Populate the dropdown menu with station names
        populateStationDropdown(stationsData);
    })
    .catch(error => console.log('Error loading Stations GeoJSON:', error));

    function populateStationDropdown(stationsData) {
        const dropdown = document.getElementById('station-dropdown');
        stationsData.features.forEach((station, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.text = station.properties.stop_name
            dropdown.add(option);
        });
    }
