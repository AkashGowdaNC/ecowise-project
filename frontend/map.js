// map.js - Interactive Map with Google Maps Directions

// Global variables
let map;
let userLocation = null;
let userMarker = null;
let centerMarkers = [];
let allCenters = [];
let currentFilter = 'all';

// Initialize map
function initMap() {
    map = L.map('map').setView([13.0072, 76.1028], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    loadCenters();
    document.getElementById('searchInput').addEventListener('input', handleSearch);
}

// Load centers from backend
async function loadCenters() {
    try {
        const response = await fetch('http://localhost:5000/recycling-centers');
        allCenters = await response.json();
        displayCenters(allCenters);
        addMarkersToMap(allCenters);
    } catch (error) {
        console.error('Error loading centers:', error);
        allCenters = getFallbackCenters();
        displayCenters(allCenters);
        addMarkersToMap(allCenters);
    }
}

// Display centers in sidebar with Google Maps button
function displayCenters(centers) {
    const centersList = document.getElementById('centersList');
    centersList.innerHTML = '';

    centers.forEach(center => {
        const card = document.createElement('div');
        card.className = 'center-card';

        card.innerHTML = `
            <div class="center-header">
                <div>
                    <div class="center-name">${center.name}</div>
                    <span class="center-type type-${center.type}">${center.type}</span>
                </div>
            </div>
            <div class="center-services">
                ${center.services.slice(0, 3).map(s => `<span class="service-tag">${s}</span>`).join('')}
            </div>
            <div class="center-info">
                <span>⭐ ${center.rating || 4.5}</span>
                <span>${center.hours || 'Check hours'}</span>
            </div>
            <button class="directions-btn" onclick="openGoogleMaps(${center.lat}, ${center.lng}, '${center.name.replace(/'/g, "\\'")}')">
                <i class="fas fa-directions"></i> Get Directions in Google Maps
            </button>
        `;

        // Add click handler for focusing (not for the button)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.directions-btn')) {
                focusCenter(center);
            }
        });

        centersList.appendChild(card);
    });
}

// Add markers to map
function addMarkersToMap(centers) {
    centerMarkers.forEach(marker => map.removeLayer(marker));
    centerMarkers = [];

    centers.forEach(center => {
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: ${getMarkerColor(center.type)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${getMarkerIcon(center.type)}</div>`,
            iconSize: [30, 30]
        });

        const marker = L.marker([center.lat, center.lng], { icon })
            .addTo(map)
            .bindPopup(`
                <div style="min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; color: #10B981;">${center.name}</h3>
                    <p style="margin: 4px 0; font-size: 0.9em;"><strong>Type:</strong> ${center.type}</p>
                    <p style="margin: 4px 0; font-size: 0.9em;"><strong>Services:</strong> ${center.services.slice(0, 2).join(', ')}</p>
                    <p style="margin: 4px 0; font-size: 0.9em;"><strong>Rating:</strong> ⭐ ${center.rating || 4.5}</p>
                    <p style="margin: 4px 0; font-size: 0.9em;"><strong>Phone:</strong> ${center.phone || 'N/A'}</p>
                    <button onclick="openGoogleMaps(${center.lat}, ${center.lng}, '${center.name.replace(/'/g, "\\'")}')" style="margin-top: 8px; padding: 8px 12px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%;">
                        <i class="fas fa-directions"></i> Get Directions
                    </button>
                </div>
            `);

        centerMarkers.push(marker);
    });
}

// Get marker color
function getMarkerColor(type) {
    switch (type) {
        case 'recycling': return '#10B981';
        case 'donation': return '#3B82F6';
        case 'special': return '#F59E0B';
        default: return '#6B7280';
    }
}

// Get marker icon
function getMarkerIcon(type) {
    switch (type) {
        case 'recycling': return '♻️';
        case 'donation': return '🤝';
        case 'special': return '⚠️';
        default: return '📍';
    }
}

// Focus on center
function focusCenter(center) {
    map.setView([center.lat, center.lng], 16);

    centerMarkers.forEach(marker => {
        const pos = marker.getLatLng();
        if (pos.lat === center.lat && pos.lng === center.lng) {
            marker.openPopup();
        }
    });

    document.querySelectorAll('.center-card').forEach(card => {
        card.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Open Google Maps with directions
function openGoogleMaps(lat, lng, name) {
    // If user location is available, show directions from current location
    if (userLocation) {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`;
        window.open(url, '_blank');
    } else {
        // If no user location, just show the destination
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
        alert('💡 Tip: Click "Use My Current Location" first to get turn-by-turn directions from your location!');
    }
}

// Filter centers
function filterCenters(type) {
    currentFilter = type;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    const filtered = type === 'all' ? allCenters : allCenters.filter(c => c.type === type);
    displayCenters(filtered);
    addMarkersToMap(filtered);
}

// Handle search
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    let filtered = currentFilter === 'all' ? allCenters : allCenters.filter(c => c.type === currentFilter);

    if (query) {
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.services.some(s => s.toLowerCase().includes(query)) ||
            c.address.toLowerCase().includes(query)
        );
    }

    displayCenters(filtered);
    addMarkersToMap(filtered);
}

// Get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                if (userMarker) {
                    map.removeLayer(userMarker);
                }

                const userIcon = L.divIcon({
                    className: 'user-marker',
                    html: '<div style="background: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20]
                });

                userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup('📍 Your Location');

                map.setView([userLocation.lat, userLocation.lng], 14);
                alert('✅ Location enabled! Now click "Get Directions" on any center to open Google Maps.');
            },
            error => {
                alert('Unable to get your location. Please enable location services.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Map controls
function zoomIn() { map.zoomIn(); }
function zoomOut() { map.zoomOut(); }
function resetView() { map.setView([13.0072, 76.1028], 13); }

// Fallback centers
function getFallbackCenters() {
    return [
        {
            id: 1,
            name: "Hassan City Municipal Waste Center",
            type: "recycling",
            address: "Near New Bus Stand, B.M. Road, Hassan 573201",
            phone: "+91 8172 268 500",
            hours: "8:00 AM - 6:00 PM (Mon-Sat)",
            services: ["Plastic", "Paper", "Glass", "Metal", "E-waste"],
            rating: 4.3,
            lat: 13.0072,
            lng: 76.1028
        },
        {
            id: 2,
            name: "Hassan Plastic Recycling Unit",
            type: "recycling",
            address: "Industrial Area, Katihalli, Hassan 573201",
            services: ["Plastic Bottles", "Containers"],
            rating: 4.1,
            lat: 13.0156,
            lng: 76.1187
        },
        {
            id: 3,
            name: "GreenTech E-Waste Hassan",
            type: "recycling",
            address: "Near Railway Station, Hassan 573201",
            services: ["Mobile Phones", "Laptops", "Batteries"],
            rating: 4.6,
            lat: 13.0022,
            lng: 76.1088
        },
        {
            id: 7,
            name: "Hassan Clothes Donation Center",
            type: "donation",
            address: "Near Malnad College, Hassan 573201",
            services: ["Clothing", "Shoes", "Blankets"],
            rating: 4.7,
            lat: 13.0167,
            lng: 76.0998
        },
        {
            id: 10,
            name: "Hassan Medical Waste Facility",
            type: "special",
            address: "Near HIMS Hospital, Hassan 573201",
            services: ["Medical Waste", "Syringes", "Medicines"],
            rating: 4.9,
            lat: 13.0056,
            lng: 76.1034
        }
    ];
}

// Initialize
document.addEventListener('DOMContentLoaded', initMap);
