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
                    color: '#6A9C89',
                    weight: 2,
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
                    findParksNearStation(feature);
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

    // Zoom to the station location
    map.setView(stationLatLng, 16);

    const parksList = document.getElementById('parks-list');
    parksList.innerHTML = "";

    let parkFound = false;
    let parksArray = [];

    greenSpacesLayer.eachLayer(function (greenSpaceLayer) {
        const greenSpaceLatLngs = greenSpaceLayer.getLatLngs();
        for (let i = 0; i < greenSpaceLatLngs.length; i++) {
            for (let j = 0; j < greenSpaceLatLngs[i].length; j++) {
                for (let k = 0; k < greenSpaceLatLngs[i][j].length; k++) {
                    const distance = map.distance(stationLatLng, greenSpaceLatLngs[i][j][k]);
                    if (distance <= 500) {
                        parksArray.push(greenSpaceLayer.feature.properties.AREA_NAME);
                        parkFound = true;
                        break;
                    }
                }
                if (parkFound) break;
            }
            if (parkFound) break;
        }
    });

    if (parksArray.length > 0) {
        // Sort the parks alphabetically
        parksArray.sort();

        // Add sorted parks to the list
        parksArray.forEach(function (parkName) {
            const parkItem = document.createElement('li');
            parkItem.textContent = parkName;
            parksList.appendChild(parkItem);
        });

        console.log('Parks within 1km:', parksArray);
    } else {
        console.log('No parks found within 1km of the selected station.');
    }
}
