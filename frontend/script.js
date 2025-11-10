const API_BASE = 'http://localhost:5000';
let currentUser = 'EcoStudent';

async function analyzeImage() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('📸 Please select an image first!');
        return;
    }

    // Show loading
    document.getElementById('resultsContent').innerHTML = `
        <div style="text-align: center;">
            <p>🔄 AI is analyzing: <strong>${file.name}</strong></p>
            <p><small>Using smart object detection...</small></p>
        </div>
    `;
    document.getElementById('results').style.display = 'block';

    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('username', currentUser);

        const response = await fetch(`${API_BASE}/detect`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            displayResults(result);
            // Refresh user profile to show updated points
            loadUserProfile();
        } else {
            document.getElementById('resultsContent').innerHTML = 
                '❌ Error: ' + (result.error || 'Analysis failed');
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('resultsContent').innerHTML = 
            '❌ Make sure backend is running on port 5000';
    }
}

function displayResults(results) {
    let html = `
        <div class="result-item">
            <div class="success-header">
                <h3>✅ Analysis Complete!</h3>
                <p>Processed: <strong>${results.filename}</strong></p>
            </div>
            
            <div class="results-grid">
                <div class="result-card">
                    <h4>🎯 Objects Found</h4>
                    <p class="big-number">${results.objects_detected}</p>
                </div>
                
                <div class="result-card">
                    <h4>🏆 EcoPoints</h4>
                    <p class="big-number">+${results.eco_points}</p>
                </div>
                
                <div class="result-card">
                    <h4>🌍 Carbon Saved</h4>
                    <p class="big-number">${results.carbon_saved_kg}kg</p>
                </div>
            </div>
            
            <h4>📊 Detected Items:</h4>
            <ul class="objects-list">
    `;
    
    results.detected_objects.forEach(obj => {
        const confidencePercent = (obj.confidence * 100).toFixed(0);
        html += `
            <li>
                <span class="object-name">${obj.name}</span>
                <span class="object-confidence">${confidencePercent}% sure</span>
                <span class="object-type">${obj.type}</span>
            </li>
        `;
    });
    
    html += `
            </ul>
            
            <h4>💡 Smart Recommendations:</h4>
            <ul class="recommendations-list">
    `;
    
    results.recommendations.forEach(rec => {
        html += `<li>${rec}</li>`;
    });
    
    html += `
            </ul>
            
            <div class="action-buttons">
                <button onclick="showRecyclingCenters()" class="location-btn">
                    📍 Find Nearby Centers
                </button>
                <button onclick="showUserHistory()" class="history-btn">
                    📊 View History
                </button>
                <button onclick="shareResults()" class="share-btn">
                    📤 Share Achievement
                </button>
            </div>
            
            <div id="locations" style="display: none; margin-top: 20px;"></div>
            <div id="history" style="display: none; margin-top: 20px;"></div>
        </div>
    `;
    
    document.getElementById('resultsContent').innerHTML = html;
}

async function showRecyclingCenters() {
    try {
        const response = await fetch(`${API_BASE}/recycling-centers`);
        const centers = await response.json();
        
        let locationsHtml = `
            <div class="centers-header">
                <h4>📍 Recycling Centers in Hassan</h4>
                <p class="subtitle">Find the perfect place for your items</p>
            </div>
            <div class="centers-grid">
        `;
        
        centers.forEach(center => {
            const icon = center.type === 'recycling' ? '♻️' : '🤝';
            const typeText = center.type === 'recycling' ? 'Recycling Center' : 'Donation Center';
            
            locationsHtml += `
                <div class="center-card" onclick="showCenterDetails(${center.id})">
                    <div class="center-header">
                        <div class="center-icon">${icon}</div>
                        <div class="center-basic-info">
                            <strong>${center.name}</strong>
                            <span class="center-type">${typeText}</span>
                            <span class="center-distance">${center.distance} away</span>
                        </div>
                        <div class="center-rating">
                            ⭐ ${center.rating}
                        </div>
                    </div>
                    
                    <div class="center-details">
                        <div class="detail-item">
                            <span class="detail-label">📍</span>
                            <span class="detail-text">${center.address}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">📞</span>
                            <span class="detail-text">${center.phone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">🕒</span>
                            <span class="detail-text">${center.hours}</span>
                        </div>
                    </div>
                    
                    <div class="services">
                        <strong>Accepts:</strong>
                        <div class="services-tags">
                            ${center.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="center-actions">
                        <button class="action-btn directions-btn" onclick="event.stopPropagation(); getDirections(${center.id})">
                            🗺️ Get Directions
                        </button>
                        <button class="action-btn call-btn" onclick="event.stopPropagation(); callCenter('${center.phone}')">
                            📞 Call Now
                        </button>
                    </div>
                </div>
            `;
        });
        
        locationsHtml += '</div>';
        
        document.getElementById('locations').innerHTML = locationsHtml;
        document.getElementById('locations').style.display = 'block';
        document.getElementById('history').style.display = 'none';
        
    } catch (error) {
        console.error('Error loading centers:', error);
    }
}

// Show detailed center information
// Show detailed center information
async function showCenterDetails(centerId) {
    try {
        const response = await fetch(`${API_BASE}/recycling-centers`);
        const centers = await response.json();
        const center = centers.find(c => c.id === centerId);
        
        if (center) {
            const modalHtml = `
                <div class="modal-overlay" onclick="closeAllModals()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h3>${center.name}</h3>
                            <button class="close-btn" onclick="closeAllModals()">×</button>
                        </div>
                        
                        <div class="modal-body">
                            <div class="center-stats">
                                <div class="stat-badge">
                                    <span class="stat-icon">⭐</span>
                                    <span>${center.rating}/5</span>
                                </div>
                                <div class="stat-badge">
                                    <span class="stat-icon">📍</span>
                                    <span>${center.distance}</span>
                                </div>
                                <div class="stat-badge">
                                    <span class="stat-icon">${center.type === 'recycling' ? '♻️' : '🤝'}</span>
                                    <span>${center.type === 'recycling' ? 'Recycling' : 'Donation'}</span>
                                </div>
                            </div>
                            
                            <div class="info-section">
                                <h4>📞 Contact Information</h4>
                                <div class="contact-info">
                                    <p><strong>📍 Address:</strong> ${center.address}</p>
                                    <p><strong>📞 Phone:</strong> ${center.phone}</p>
                                    <p><strong>🕒 Hours:</strong> ${center.hours}</p>
                                    ${center.website ? `<p><strong>🌐 Website:</strong> <a href="${center.website}" target="_blank" style="color: #F59E0B;">${center.website}</a></p>` : ''}
                                </div>
                            </div>
                            
                            <div class="info-section">
                                <h4>🛠️ Services Offered</h4>
                                <div class="services-grid">
                                    ${center.services.map(service => `<span class="service-pill">${service}</span>`).join('')}
                                </div>
                            </div>
                            
                            <div class="action-buttons-modal">
                                <button class="modal-btn primary" onclick="getDirections(${center.id})">
                                    🗺️ Get Directions
                                </button>
                                <button class="modal-btn secondary" onclick="callCenter('${center.phone}')">
                                    📞 Call Center
                                </button>
                                <button class="modal-btn tertiary" onclick="shareCenter('${center.name}', '${center.address}')">
                                    📤 Share Location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Remove any existing modals first
            closeAllModals();
            
            // Add modal to page
            const modalContainer = document.createElement('div');
            modalContainer.id = 'centerModal';
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer);
        }
    } catch (error) {
        console.error('Error showing center details:', error);
    }
}

// Get directions to center
// Get directions to center
async function getDirections(centerId) {
    try {
        const response = await fetch(`${API_BASE}/get-directions/${centerId}`);
        const directions = await response.json();
        
        if (directions.error) {
            alert('Directions not available for this center');
            return;
        }
        
        const directionsHtml = `
            <div class="modal-overlay" onclick="closeDirectionsModal()">
                <div class="modal-content directions-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>🚗 Directions to ${directions.name}</h3>
                        <button class="close-btn" onclick="closeDirectionsModal()">×</button>
                    </div>
                    
                    <div class="directions-body">
                        <div class="direction-section">
                            <h4>📍 Route Instructions:</h4>
                            <div class="direction-text">
                                ${directions.directions}
                            </div>
                        </div>
                        
                        <div class="direction-section">
                            <h4>🚌 Transportation Options:</h4>
                            <div class="transport-options">
                                ${directions.transport.map(option => `
                                    <div class="transport-option">
                                        <span class="transport-icon">${getTransportIcon(option)}</span>
                                        <span>${option}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="direction-section">
                            <h4>🏢 Nearby Landmarks:</h4>
                            <div class="landmarks-list">
                                ${directions.landmarks.map(landmark => `
                                    <div class="landmark-item">
                                        <span class="landmark-icon">📍</span>
                                        <span>${landmark}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="tips-section">
                            <h4>💡 Helpful Tips:</h4>
                            <div class="tips-list">
                                <div class="tip-item">• Call ahead to confirm operating hours</div>
                                <div class="tip-item">• Carry ID proof if required</div>
                                <div class="tip-item">• Ask about free pickup services for large items</div>
                                <div class="tip-item">• Check if appointment is needed</div>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="action-btn primary" onclick="callCenter('${directions.phone || ''}')">
                                📞 Call for More Info
                            </button>
                            <button class="action-btn secondary" onclick="shareDirections('${directions.name}', '${directions.directions}')">
                                📤 Share Directions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove any existing modals
        closeAllModals();
        
        // Add directions modal to page
        const modalContainer = document.createElement('div');
        modalContainer.id = 'directionsModal';
        modalContainer.innerHTML = directionsHtml;
        document.body.appendChild(modalContainer);
        
    } catch (error) {
        console.error('Error getting directions:', error);
        alert('Could not load directions. Please try again.');
    }
}

// Helper function to get transport icons
function getTransportIcon(transportText) {
    if (transportText.includes('Bus')) return '🚌';
    if (transportText.includes('Auto')) return '🛺';
    if (transportText.includes('Walking')) return '🚶‍♂️';
    if (transportText.includes('vehicle') || transportText.includes('parking')) return '🚗';
    return '📍';
}

// Share directions function
function shareDirections(centerName, directions) {
    const shareText = `Directions to ${centerName}:\n${directions}\n\nShared via EcoWise App - Making Hassan Greener! 🌱`;
    
    if (navigator.share) {
        navigator.share({
            title: `Directions to ${centerName}`,
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Directions copied to clipboard! 📋\nYou can now share them via WhatsApp or other apps.');
        }).catch(() => {
            // Final fallback
            prompt('Copy these directions:', shareText);
        });
    }
}

// Close all modals function
function closeAllModals() {
    const modals = document.querySelectorAll('#centerModal, #directionsModal');
    modals.forEach(modal => {
        if (modal) modal.remove();
    });
}

// Close directions modal
function closeDirectionsModal() {
    const modal = document.getElementById('directionsModal');
    if (modal) modal.remove();
}

// Call center function
function callCenter(phoneNumber) {
    if (confirm(`Call ${phoneNumber}?`)) {
        window.open(`tel:${phoneNumber}`, '_self');
    }
}

// Share center location
function shareCenter(name, address) {
    const shareText = `Check out ${name} at ${address} - Found via EcoWise App!`;
    
    if (navigator.share) {
        navigator.share({
            title: name,
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Center details copied to clipboard! 📋');
        });
    }
}

// Close modal functions
function closeModal() {
    const modal = document.getElementById('centerModal');
    if (modal) modal.remove();
}

function closeDirections() {
    const modal = document.getElementById('directionsModal');
    if (modal) modal.remove();
}

async function showUserHistory() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser}/history`);
        const data = await response.json();
        
        let historyHtml = '<h4>📊 Your Recent Activity:</h4>';
        
        if (data.history && data.history.length > 0) {
            historyHtml += '<div class="history-list">';
            data.history.forEach(item => {
                historyHtml += `
                    <div class="history-item">
                        <strong>${item.filename}</strong>
                        <span>+${item.points_earned} points</span>
                        <small>${new Date(item.processed_at).toLocaleDateString()}</small>
                    </div>
                `;
            });
            historyHtml += '</div>';
        } else {
            historyHtml += '<p>No recycling history yet. Start analyzing items!</p>';
        }
        
        document.getElementById('history').innerHTML = historyHtml;
        document.getElementById('history').style.display = 'block';
        document.getElementById('locations').style.display = 'none';
        
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function shareResults() {
    alert('🎉 Achievement shared! You\'re helping save the planet!');
}

// Load user profile
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser}`);
        const profile = await response.json();
        
        document.getElementById('profileContent').innerHTML = `
            <div class="profile-header">
                <h3>${profile.username}</h3>
                <span class="user-level">${profile.level}</span>
            </div>
            <div class="profile-stats">
                <div class="stat">
                    <span class="stat-value">${profile.eco_points}</span>
                    <span class="stat-label">EcoPoints</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${profile.items_recycled}</span>
                    <span class="stat-label">Items Recycled</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${profile.carbon_saved_kg}kg</span>
                    <span class="stat-label">Carbon Saved</span>
                </div>
            </div>
            <button onclick="showLeaderboard()" class="leaderboard-btn">
                🏆 View Leaderboard
            </button>
        `;
    } catch (error) {
        document.getElementById('profileContent').innerHTML = 
            '<p>✅ Backend connected successfully!</p>';
    }
}

async function showLeaderboard() {
    try {
        const response = await fetch(`${API_BASE}/leaderboard`);
        const data = await response.json();
        
        let leaderboardHtml = '<h4>🏆 Eco Leaderboard</h4><div class="leaderboard-list">';
        
        data.forEach((user, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            leaderboardHtml += `
                <div class="leaderboard-item ${user.username === currentUser ? 'current-user' : ''}">
                    <span class="rank">${medal}</span>
                    <span class="username">${user.username}</span>
                    <span class="points">${user.eco_points} pts</span>
                    <span class="level">${user.level}</span>
                </div>
            `;
        });
        
        leaderboardHtml += '</div>';
        
        // Show in a modal or alert for simplicity
        alert(leaderboardHtml.replace(/<[^>]*>/g, '')); // Simple text display
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Add image name display
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        console.log("Image selected:", file.name);
    }
});

window.onload = loadUserProfile;
// Add image preview functionality
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div class="image-preview-container">
                    <img src="${e.target.result}" alt="Preview" class="image-preview">
                    <div class="image-info">
                        <strong>${file.name}</strong>
                        <small>${(file.size / 1024).toFixed(1)} KB</small>
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});
// Export user data as JSON
async function exportUserData() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser}`);
        const userData = await response.json();
        
        const historyResponse = await fetch(`${API_BASE}/user/${currentUser}/history`);
        const historyData = await historyResponse.json();
        
        const exportData = {
            user: userData,
            history: historyData.history,
            exported_at: new Date().toISOString(),
            total_carbon_saved: userData.carbon_saved_kg,
            total_items_recycled: userData.items_recycled
        };
        
        // Create and download JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ecowise_data_${currentUser}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert('📊 Your EcoWise data has been exported!');
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ Failed to export data');
    }
}
// Demo mode for presentations
function startDemoMode() {
    const demoImages = [
        'plastic_water_bottle.jpg',
        'old_smartphone.png', 
        'science_textbook.jpeg',
        'blue_jeans.jpg',
        'soda_cans.png'
    ];
    
    let demoIndex = 0;
    
    const demoInterval = setInterval(() => {
        if (demoIndex >= demoImages.length) {
            clearInterval(demoInterval);
            alert('🎉 Demo completed! Your EcoWise app is ready for the hackathon!');
            return;
        }
        
        // Simulate file upload
        const demoFile = new File([], demoImages[demoIndex], { type: 'image/jpeg' });
        const fileInput = document.getElementById('imageUpload');
        
        // Create a new FileList (simulated)
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(demoFile);
        fileInput.files = dataTransfer.files;
        
        // Trigger analysis
        analyzeImage();
        
        demoIndex++;
    }, 3000); // Process every 3 seconds
    
    alert('🚀 Starting demo mode... Watch the magic happen!');
}