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
