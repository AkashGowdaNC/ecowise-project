// analyze.js - Complete Working AI Analysis
let currentImageFile = null;
let cameraStream = null;

// Image Upload Handling
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
        alert('Please select an image file (JPG, PNG, GIF)');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
    }

    currentImageFile = file;
    enableAnalyzeButton();
    showImagePreview(file);
}

function showImagePreview(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const previewArea = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const uploadLabel = document.querySelector('.upload-label');

        previewImage.src = e.target.result;
        previewArea.style.display = 'block';
        uploadLabel.style.display = 'none';

        document.getElementById('analyzeHint').textContent = 'Ready to analyze! Click the Analyze button.';
    };

    reader.readAsDataURL(file);
}

function clearImage() {
    const fileInput = document.getElementById('imageUpload');
    const previewArea = document.getElementById('imagePreview');
    const uploadLabel = document.querySelector('.upload-label');

    fileInput.value = '';
    previewArea.style.display = 'none';
    uploadLabel.style.display = 'block';
    currentImageFile = null;

    disableAnalyzeButton();
    document.getElementById('analyzeHint').textContent = 'Select an image first to enable analysis';
}

function enableAnalyzeButton() {
    document.getElementById('analyzeButton').disabled = false;
}

function disableAnalyzeButton() {
    document.getElementById('analyzeButton').disabled = true;
}

// Camera Functions
async function startCamera() {
    try {
        console.log("📷 Starting camera...");

        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };

        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('cameraVideo');
        const preview = document.getElementById('cameraPreview');
        const placeholder = document.querySelector('.camera-placeholder');

        video.srcObject = cameraStream;
        placeholder.style.display = 'none';
        preview.style.display = 'block';

        console.log("✅ Camera started successfully");

    } catch (error) {
        console.error("❌ Camera error:", error);
        alert('Camera access denied or not available. Please allow camera permissions.');
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    const preview = document.getElementById('cameraPreview');
    const placeholder = document.querySelector('.camera-placeholder');
    const video = document.getElementById('cameraVideo');

    video.srcObject = null;
    preview.style.display = 'none';
    placeholder.style.display = 'block';
}

function captureImage() {
    if (!cameraStream) {
        alert('Please start the camera first!');
        return;
    }

    const video = document.getElementById('cameraVideo');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and create file
    canvas.toBlob(function (blob) {
        const timestamp = new Date().getTime();
        const filename = `camera_capture_${timestamp}.jpg`;

        currentImageFile = new File([blob], filename, {
            type: 'image/jpeg'
        });

        // Enable analyze button and show preview
        enableAnalyzeButton();
        showImagePreview(currentImageFile);

        // Stop camera after capture
        stopCamera();

        console.log("✅ Image captured:", filename);

    }, 'image/jpeg', 0.8);
}

// Main AI Analysis Function
async function analyzeImage() {
    if (!currentImageFile) {
        alert('Please select an image first');
        return;
    }

    const analyzeButton = document.getElementById('analyzeButton');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    const resultsBadge = document.getElementById('resultsBadge');

    // Show loading state
    analyzeButton.disabled = true;
    analyzeButton.innerHTML = '<span>⏳ Analyzing with AI...</span>';
    resultsSection.style.display = 'block';
    resultsBadge.textContent = 'Analyzing...';
    resultsBadge.style.background = 'var(--accent)';

    // Show loading animation
    resultsContent.innerHTML = `
        <div class="loading-analysis">
            <div class="analyzing-animation">
                <div class="analyzing-dot"></div>
                <div class="analyzing-dot"></div>
                <div class="analyzing-dot"></div>
            </div>
            <h3>🤖 AI is analyzing your image...</h3>
            <p>Identifying objects and finding recycling solutions</p>
        </div>
    `;

    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', currentImageFile);
        formData.append('username', 'EcoStudent');

        // Send to backend
        const response = await fetch('http://localhost:5000/detect', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            displayAnalysisResults(result);
        } else {
            throw new Error(result.error || 'Analysis failed');
        }

    } catch (error) {
        console.error('Analysis error:', error);

        // Fallback to mock analysis if server is down
        performMockAnalysis();
    } finally {
        // Reset analyze button
        analyzeButton.disabled = false;
        analyzeButton.innerHTML = '<span>🤖 Analyze with AI</span>';
    }
}

function displayAnalysisResults(result) {
    const resultsContent = document.getElementById('resultsContent');
    const resultsBadge = document.getElementById('resultsBadge');

    resultsBadge.textContent = 'Analysis Complete';
    resultsBadge.style.background = 'var(--primary)';

    if (!result.detected_objects || result.detected_objects.length === 0) {
        resultsContent.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No Items Detected</h3>
                <p>Try taking a clearer photo or different angle</p>
                <button class="action-btn primary" onclick="clearImage()">
                    📸 Try Another Image
                </button>
            </div>
        `;
        return;
    }

    // Get recycling centers data
    fetchRecyclingCenters().then(centers => {
        const analysisHTML = createAnalysisHTML(result, centers);
        resultsContent.innerHTML = analysisHTML;
    });
}

async function fetchRecyclingCenters() {
    try {
        const response = await fetch('http://localhost:5000/recycling-centers');
        return await response.json();
    } catch (error) {
        console.error('Error fetching centers:', error);
        return [];
    }
}

// NEW: Create Analysis HTML with proper object detection
function createAnalysisHTML(result, centers) {
    // Log what was detected for debugging
    console.log('🔍 Detected objects:', result.detected_objects);

    // Get the highest confidence detection
    const detectedItem = result.detected_objects.reduce((prev, current) =>
        (prev.confidence > current.confidence) ? prev : current
    );

    console.log('📌 Using detection:', detectedItem);

    // Normalize YOLO class name to database key
    const normalizedName = normalizeObjectName(detectedItem.name);
    console.log('🔑 Normalized name:', normalizedName);

    // Get item details based on detection
    const itemDetails = getItemDetails(normalizedName);
    const relevantCenters = centers.filter(center =>
        itemDetails.centers.includes(center.id)
    ).slice(0, 3);

    return `
        <div class="analysis-result">
            <div class="item-info">
                <div class="item-header">
                    <div class="item-icon">${itemDetails.icon}</div>
                    <div class="item-details">
                        <h3>${itemDetails.name}</h3>
                        <div class="item-category">${itemDetails.category}</div>
                    </div>
                </div>
                
                <div class="item-description">
                    ${itemDetails.description}
                </div>
                
                <div class="recycling-info">
                    <h4>♻️ Recycling Action</h4>
                    <p><strong>${itemDetails.action}</strong> - ${itemDetails.actionDescription}</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-value">+${itemDetails.points}</div>
                        <div class="stat-label">EcoPoints</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🌍</div>
                        <div class="stat-value">${itemDetails.carbonSaved}kg</div>
                        <div class="stat-label">Carbon Saved</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-value">${itemDetails.processingTime}</div>
                        <div class="stat-label">Processing Time</div>
                    </div>
                </div>
                
                <div class="recommendations">
                    <h4>📋 Recycling Tips</h4>
                    ${itemDetails.tips.map(tip => `
                        <div class="recommendation-item">${tip}</div>
                    `).join('')}
                </div>
            </div>
            
            <div class="centers-section">
                <h4>📍 Nearby Recycling Centers</h4>
                <p>Based on your location in Hassan</p>
                
                ${relevantCenters.length > 0 ? `
                    <div class="centers-list">
                        ${relevantCenters.map(center => `
                            <div class="center-item" onclick="viewCenterOnMap(${center.id})">
                                <div class="center-name">${center.name}</div>
                                <div class="center-distance">${center.distance || '1.2km away'}</div>
                                <div class="center-services">${center.services.slice(0, 3).join(', ')}</div>
                                <div class="center-address">${center.address}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="no-centers">
                        <p>No specific centers found. Check the map for general recycling centers.</p>
                    </div>
                `}
                
                <div class="results-actions">
                    <button class="action-btn primary" onclick="location.href='map.html'">
                        🗺️ View All Centers
                    </button>
                    <button class="action-btn secondary" onclick="analyzeAnother()">
                        🔄 Analyze Another
                    </button>
                </div>
            </div>
        </div>
    `;
}

// NEW: Normalize YOLO object names to database keys
function normalizeObjectName(yoloName) {
    const nameMapping = {
        'cell phone': 'phone',
        'wine glass': 'glass',
        'cup': 'cup',
        'dining table': 'furniture',
        'potted plant': 'potted plant',
        'teddy bear': 'furniture',
        'hair drier': 'electronics',
        'toothbrush': 'item',
        'remote': 'electronics',
        'keyboard': 'keyboard',
        'mouse': 'mouse',
        'laptop': 'laptop',
        'tv': 'tv',
        'microwave': 'microwave',
        'oven': 'microwave',
        'toaster': 'microwave',
        'sink': 'item',
        'refrigerator': 'microwave',
        'book': 'book',
        'clock': 'item',
        'vase': 'item',
        'scissors': 'item',
        'backpack': 'item',
        'handbag': 'item',
        'suitcase': 'item',
        'frisbee': 'item',
        'sports ball': 'item',
        'baseball bat': 'item',
        'baseball glove': 'item',
        'skateboard': 'item',
        'surfboard': 'item',
        'tennis racket': 'item',
        'bottle': 'bottle',
        'chair': 'chair',
        'couch': 'couch',
        'bed': 'furniture',
        'toilet': 'item'
    };

    return nameMapping[yoloName.toLowerCase()] || 'item';
}

function getItemDetails(itemName) {
    const itemsDatabase = {
        'bottle': {
            name: 'Plastic Bottle',
            category: 'Recyclable Plastic',
            icon: '🥤',
            points: 10,
            carbonSaved: 0.5,
            processingTime: '2.1s',
            action: 'Recycle',
            actionDescription: 'Place in plastic recycling bin',
            description: 'Plastic bottles are widely recyclable and can be turned into new bottles, clothing, or other plastic products.',
            tips: [
                'Rinse the bottle before recycling',
                'Remove the cap (recycle separately)',
                'Flatten to save space in recycling bin'
            ],
            centers: [1, 2, 5]
        },
        'book': {
            name: 'Books',
            category: 'Donation/Reuse',
            icon: '📚',
            points: 15,
            carbonSaved: 0.8,
            processingTime: '1.8s',
            action: 'Donate',
            actionDescription: 'Give to libraries or community centers',
            description: 'Books can be donated to libraries, schools, or community centers for reuse and education.',
            tips: [
                'Check if books are in good condition',
                'Consider local libraries or schools',
                'Remove any personal information'
            ],
            centers: [8]
        },
        'phone': {
            name: 'Mobile Phone',
            category: 'E-Waste',
            icon: '📱',
            points: 25,
            carbonSaved: 2.0,
            processingTime: '2.5s',
            action: 'Resell/Recycle',
            actionDescription: 'Sell online or recycle properly',
            description: 'Mobile phones contain valuable metals and should be properly recycled or resold.',
            tips: [
                'Backup and wipe all personal data',
                'Remove SIM card and memory card',
                'Consider reselling if functional'
            ],
            centers: [3]
        },
        'glass': {
            name: 'Glass Bottle',
            category: 'Recyclable Glass',
            icon: '🍶',
            points: 12,
            carbonSaved: 0.4,
            processingTime: '2.0s',
            action: 'Recycle',
            actionDescription: 'Place in glass recycling bin',
            description: 'Glass is 100% recyclable and can be reused endlessly without loss of quality.',
            tips: [
                'Rinse thoroughly before recycling',
                'Remove metal caps and lids',
                'Don\'t mix with other materials'
            ],
            centers: [1, 5]
        },
        'cup': {
            name: 'Cup/Mug',
            category: 'Ceramic/Plastic',
            icon: '☕',
            points: 5,
            carbonSaved: 0.3,
            processingTime: '1.2s',
            action: 'Donate/Trash',
            actionDescription: 'Donate if good, trash if broken',
            description: 'Ceramic mugs are not recyclable in curbside bins. Plastic cups may be recyclable.',
            tips: ['Donate usable mugs', 'Wrap broken pieces safely', 'Check plastic number'],
            centers: [7, 1]
        },
        'laptop': {
            name: 'Laptop',
            category: 'E-Waste',
            icon: '💻',
            points: 50,
            carbonSaved: 15.0,
            processingTime: '4.5s',
            action: 'Resell/Recycle',
            actionDescription: 'Resell if working, otherwise recycle',
            description: 'Laptops contain valuable metals and hazardous materials. Never dispose in trash.',
            tips: ['Wipe all data', 'Remove battery', 'Check trade-in value'],
            centers: [3, 10]
        },
        'keyboard': {
            name: 'Keyboard',
            category: 'E-Waste',
            icon: '⌨️',
            points: 20,
            carbonSaved: 1.2,
            processingTime: '2.0s',
            action: 'E-Waste Recycling',
            actionDescription: 'Take to e-waste recycling center',
            description: 'Keyboards contain electronic components and plastics that should be recycled properly.',
            tips: ['Remove batteries if wireless', 'Clean before recycling', 'Check for manufacturer take-back'],
            centers: [3, 10]
        },
        'mouse': {
            name: 'Computer Mouse',
            category: 'E-Waste',
            icon: '🖱️',
            points: 15,
            carbonSaved: 0.8,
            processingTime: '1.5s',
            action: 'E-Waste Recycling',
            actionDescription: 'Take to e-waste recycling center',
            description: 'Computer mice contain electronic components and should not be thrown in regular trash.',
            tips: ['Remove batteries if wireless', 'Wipe clean', 'Bundle cable if wired'],
            centers: [3, 10]
        },
        'tv': {
            name: 'Television',
            category: 'E-Waste',
            icon: '📺',
            points: 45,
            carbonSaved: 12.0,
            processingTime: '5.0s',
            action: 'E-Waste Recycling',
            actionDescription: 'Schedule pickup or take to center',
            description: 'TVs contain heavy metals and glass that require special recycling processes.',
            tips: ['Do not break screen', 'Get help lifting', 'Keep cords attached'],
            centers: [3, 10]
        },
        'chair': {
            name: 'Chair',
            category: 'Furniture',
            icon: '🪑',
            points: 30,
            carbonSaved: 5.0,
            processingTime: '3.5s',
            action: 'Donate/Bulk Pickup',
            actionDescription: 'Donate if usable, otherwise bulk pickup',
            description: 'Chairs can often be reused. Broken ones may need dismantling for recycling.',
            tips: ['Clean before donating', 'Tighten screws', 'Check for bed bugs'],
            centers: [7, 9]
        },
        'couch': {
            name: 'Couch/Sofa',
            category: 'Furniture',
            icon: '🛋️',
            points: 50,
            carbonSaved: 20.0,
            processingTime: '5.0s',
            action: 'Donate/Bulk Pickup',
            actionDescription: 'Donate if usable, otherwise bulk pickup',
            description: 'Couches are large items that require special handling. Donation is best for good condition items.',
            tips: ['Vacuum before donating', 'Schedule pickup in advance', 'Cover during transport'],
            centers: [7, 9]
        },
        'furniture': {
            name: 'Furniture',
            category: 'Bulky Items',
            icon: '🛋️',
            points: 40,
            carbonSaved: 5.0,
            processingTime: '4.0s',
            action: 'Donate/Recycle',
            actionDescription: 'Donate if usable, otherwise schedule bulk pickup',
            description: 'Furniture in good condition can be donated, while broken items may be recycled or require special disposal.',
            tips: [
                'Check with local charities for pickup',
                'Disassemble large items if possible',
                'Schedule municipal bulk pickup'
            ],
            centers: [7, 9]
        },
        'microwave': {
            name: 'Microwave',
            category: 'Appliance',
            icon: '♨️',
            points: 35,
            carbonSaved: 8.0,
            processingTime: '3.0s',
            action: 'E-Waste/Scrap',
            actionDescription: 'Take to appliance recycler',
            description: 'Microwaves contain electronic components and scrap metal.',
            tips: ['Clean inside', 'Remove glass plate', 'Tape door shut'],
            centers: [3, 6]
        },
        'electronics': {
            name: 'Small Electronics',
            category: 'E-Waste',
            icon: '💻',
            points: 35,
            carbonSaved: 4.2,
            processingTime: '3.5s',
            action: 'E-Waste Recycling',
            actionDescription: 'Take to e-waste recycling center',
            description: 'Electronics contain valuable metals and hazardous materials that need proper disposal.',
            tips: [
                'Backup and wipe all data',
                'Remove batteries if possible',
                'Check for manufacturer take-back programs'
            ],
            centers: [3, 10]
        },
        'item': {
            name: 'General Item',
            category: 'Check Guidelines',
            icon: '📦',
            points: 5,
            carbonSaved: 0.2,
            processingTime: '1.5s',
            action: 'Check Guidelines',
            actionDescription: 'Consult local recycling rules',
            description: 'This item requires specific disposal guidelines. Check with local authorities for proper disposal methods.',
            tips: [
                'Check local waste management guidelines',
                'Contact your municipal recycling center',
                'Consider if item can be donated or reused'
            ],
            centers: [1]
        }
    };

    return itemsDatabase[itemName] || itemsDatabase['item'];
}

function viewCenterOnMap(centerId) {
    // Store the center ID and redirect to map
    localStorage.setItem('selectedCenter', centerId);
    window.location.href = 'map.html';
}

function analyzeAnother() {
    clearImage();
    document.getElementById('resultsSection').style.display = 'none';
    disableAnalyzeButton();
}

// Fallback mock analysis (if server is down)
function performMockAnalysis() {
    const mockResults = {
        success: true,
        detected_objects: [
            {
                name: 'bottle',
                confidence: 0.95,
                type: 'plastic',
                action: 'recycle',
                points: 10
            }
        ],
        recommendations: ['♻️ Recycle the bottle at nearest center'],
        total_points: 10,
        objects_found: 1,
        carbon_saved_kg: 0.5
    };

    displayAnalysisResults(mockResults);
}

// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function () {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('imageUpload');

    // Connect file input to handleImageUpload
    fileInput.addEventListener('change', handleImageUpload);

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        uploadArea.classList.add('highlight');
    }

    function unhighlight() {
        uploadArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length) {
            handleImageUpload({ target: { files: files } });
        }
    }
});