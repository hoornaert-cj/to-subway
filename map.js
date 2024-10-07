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
            style: function (feature) {
                return {
                    color: 'orange',
                    weight: 1,
                    fillOpacity: 0.5
                };
            },
            onEachFeature: function (feature, layer) {
                console.log('Green Space Loaded:', feature.properties.AREA_NAME);
            }
        }).addTo(map);
    })
    .catch(error => console.log('Error loading Green Spaces GeoJSON:', error));

// Load GeoJSON for Subway Stations
fetch('data/stations.geojson')
    .then(response => response.json())
    .then(stationsData => {
        stationsLayer = L.geoJSON(stationsData, {
            pointToLayer: function (feature, latlng) {
                const marker = L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'icons/Subway-Icon.png',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32]
                    })
                });

                // Add click event listener for the marker
                marker.on('click', function () {
                    findParksNearStation(feature); // Call the function when marker is clicked
                });

                return marker;
            }
        }).addTo(map);

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

    // When user selects from dropdown
    dropdown.addEventListener('change', function () {
        const selectedIndex = dropdown.value;
        if (selectedIndex !== "") {
            const selectedStation = stationsData.features[selectedIndex];
            findParksNearStation(selectedStation);
        }
    });
}

function findParksNearStation(station) {
    const stationLatLng = [station.geometry.coordinates[1], station.geometry.coordinates[0]];

    console.log('Selected Station:', station.properties.stop_name);
    console.log('Station Coordinates:', stationLatLng);

    // Attempt to zoom to the station location
    map.setView(stationLatLng, 16);

    const parksList = document.getElementById('parks-list');
    parksList.innerHTML = ""; // Clear previous results

    let parkFound = false;

    greenSpacesLayer.eachLayer(function (greenSpaceLayer) {
        const greenSpaceLatLngs = greenSpaceLayer.getLatLngs();
        for (let i = 0; i < greenSpaceLatLngs.length; i++) {
            for (let j = 0; j < greenSpaceLatLngs[i].length; j++) {
                for (let k = 0; k < greenSpaceLatLngs[i][j].length; k++) {
                    const distance = map.distance(stationLatLng, greenSpaceLatLngs[i][j][k]);
                    if (distance <= 1000) { // Use 1km buffer
                        const parkItem = document.createElement('li');
                        parkItem.textContent = greenSpaceLayer.feature.properties.AREA_NAME;
                        parksList.appendChild(parkItem);

                        console.log('Park within 1km:', greenSpaceLayer.feature.properties.AREA_NAME);
                        parkFound = true;
                        break;
                    }
                }
                if (parkFound) break;
            }
            if (parkFound) break;
        }
    });

    if (!parkFound) {
        console.log('No parks found within 1km of the selected station.');
    }
}
