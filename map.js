var map = L.map('map').setView([43.66572016527307, -79.41484428761677], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let greenSpacesLayer, stationsLayer;

// Load GeoJSON for Green Spaces
fetch('data/Green Spaces.geojson')
    .then(response => response.json())
    .then(data => {
        greenSpacesLayer = L.geoJSON(data, {
            onEachFeature: function (feature, layer) {
                console.log('Green Space Loaded:', feature.properties.AREA_NAME);
            }
        }).addTo(map);
        console.log('Green spaces layer loaded:', greenSpacesLayer);
    })
    .catch(error => console.log('Error loading Green Spaces GeoJSON:', error));

// Load GeoJSON for Subway Stations
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
            },
            onEachFeature: function (feature, layer) {
                console.log('Station Loaded:', feature.properties.stop_name);
            }
        }).addTo(map);
        console.log('Stations layer loaded:', stationsLayer);

        populateStationDropdown(stationsData);
    })
    .catch(error => console.log('Error loading Stations GeoJSON:', error));

function populateStationDropdown(stationsData) {
    const dropdown = document.getElementById('station-dropdown');
    stationsData.features.forEach((station, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = station.properties.stop_name;
        dropdown.add(option);
    });

    dropdown.addEventListener('change', function () {
        const selectedStationIndex = dropdown.value;
        if (selectedStationIndex !== "") {
            findParksNearStation(stationsData.features[selectedStationIndex]);
        }
    });
}

function findParksNearStation(station) {
    const stationLatLng = L.latLng(station.geometry.coordinates[1], station.geometry.coordinates[0]);
    const radius = 500; // 1 kilometer in meters

    console.log('Finding parks near station:', station.properties.stop_name, 'at', stationLatLng);

    const parksList = document.getElementById('parks-list');
    parksList.innerHTML = ""; // Clear previous results

    greenSpacesLayer.eachLayer(function(greenSpaceLayer) {
        const greenSpaceLatLng = greenSpaceLayer.getBounds().getCenter();
        const distance = stationLatLng.distanceTo(greenSpaceLatLng);

        if (distance <= radius) {
            const parkItem = document.createElement('li');
            parkItem.textContent = greenSpaceLayer.feature.properties.AREA_NAME;
            parksList.appendChild(parkItem);

            console.log('Park within 1km:', greenSpaceLayer.feature.properties.AREA_NAME);
        } else {
            console.log('No intersection for:', greenSpaceLayer.feature.properties.AREA_NAME);
        }
    });
}
