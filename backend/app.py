from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
from ai_service import ai_engine
from database import db
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

print("🚀 EcoWise Server Starting...")
print("✅ Database: SQLite (ecowise.db)")
print("✅ AI: YOLOv8 Service")
print("📍 Access at: http://localhost:5000")

@app.route('/')
def home():
    return jsonify({
        "message": "🌱 EcoWise Backend is running!",
        "status": "success", 
        "version": "2.0",
        "ai_type": "yolov8",
        "database": "sqlite",
        "features": ["object_detection", "user_profiles", "recycling_history", "eco_points"]
    })

@app.route('/detect', methods=['POST'])
def detect_objects():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file"}), 400
        
        file = request.files['image']
        username = request.form.get('username', 'EcoStudent')
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        print(f"📸 Processing: {file.filename}")
        
        # Save file securely
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # REAL AI detection using YOLOv8
        detected_objects = ai_engine.detect_objects(file_path)
        analysis_result = ai_engine.get_recommendation(detected_objects)
        
        # Save to database
        db.update_user_points(username, analysis_result['eco_points'], analysis_result['detected_count'])
        db.add_recycling_history(
            username, 
            file.filename, 
            detected_objects, 
            analysis_result['eco_points'],
            analysis_result['recommendations']
        )
        
        # Get updated user info
        user_info = db.get_user(username)
        
        print(f"✅ Analysis complete: {len(detected_objects)} objects detected")
        
        return jsonify({
            "success": True,
            "filename": file.filename,
            "detected_objects": detected_objects,
            "recommendations": analysis_result["recommendations"],
            "eco_points": analysis_result["eco_points"],
            "objects_detected": analysis_result["detected_count"],
            "carbon_saved_kg": analysis_result["eco_points"] * 0.3, # Estimate
            "user_stats": user_info
        })
        
    except Exception as e:
        print(f"❌ Error in /detect: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/user/<username>')
def get_user(username):
    try:
        user = db.get_user(username)
        if user:
            return jsonify(user)
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print(f"❌ Error in /user: {e}")
        return jsonify({"error": "Database error"}), 500

@app.route('/user/<username>/history')
def get_user_history(username):
    try:
        history = db.get_user_history(username, 5)
        return jsonify({"history": history})
    except Exception as e:
        print(f"❌ Error in /user/history: {e}")
        return jsonify({"error": "Database error"}), 500

@app.route('/user/<username>/update', methods=['POST'])
def update_user(username):
    try:
        data = request.json
        points = data.get('points', 0)
        items = data.get('items', 0)
        
        db.update_user_points(username, points, items)
        user = db.get_user(username)
        
        return jsonify({"success": True, "user": user})
    except Exception as e:
        print(f"❌ Error in /user/update: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/recycling-centers')
def get_recycling_centers():
    """Get real recycling centers in Hassan with GPS coordinates"""
    centers = [
        {
            "id": 1,
            "name": "Hassan City Municipal Waste Center",
            "type": "recycling",
            "address": "Near New Bus Stand, B.M. Road, Hassan 573201",
            "phone": "+91 8172 268 500",
            "hours": "8:00 AM - 6:00 PM (Mon-Sat)",
            "services": ["Plastic", "Paper", "Glass", "Metal", "E-waste"],
            "rating": 4.3,
            "lat": 13.0072,
            "lng": 76.1028,
            "website": "http://hassanmunicipal.gov.in"
        },
        {
            "id": 2,
            "name": "Hassan Plastic Recycling Unit",
            "type": "recycling",
            "address": "Industrial Area, Katihalli, Hassan 573201",
            "phone": "+91 8172 268 678",
            "hours": "9:00 AM - 5:00 PM (Mon-Fri)",
            "services": ["Plastic Bottles", "Containers", "Packaging"],
            "rating": 4.1,
            "lat": 13.0156,
            "lng": 76.1187,
            "website": ""
        },
        {
            "id": 3,
            "name": "GreenTech E-Waste Hassan",
            "type": "recycling",
            "address": "Near Railway Station, Hassan 573201",
            "phone": "+91 94488 11223",
            "hours": "9:30 AM - 6:30 PM (Mon-Sat)",
            "services": ["Mobile Phones", "Laptops", "Batteries", "Electronics"],
            "rating": 4.6,
            "lat": 13.0022,
            "lng": 76.1088,
            "website": ""
        },
        {
            "id": 4,
            "name": "Hassan Paper Recycling Plant",
            "type": "recycling",
            "address": "Salagame Road, Hassan 573201",
            "phone": "+91 8172 266 123",
            "hours": "8:30 AM - 5:30 PM (Mon-Sat)",
            "services": ["Newspaper", "Cardboard", "Office Paper", "Books"],
            "rating": 4.2,
            "lat": 13.0089,
            "lng": 76.0923,
            "website": ""
        },
        {
            "id": 5,
            "name": "Hassan Glass Collection Center",
            "type": "recycling",
            "address": "M.G. Road, Hassan 573201",
            "phone": "+91 99000 22334",
            "hours": "10:00 AM - 4:00 PM (Tue-Sun)",
            "services": ["Glass Bottles", "Jars", "Containers"],
            "rating": 4.0,
            "lat": 13.0055,
            "lng": 76.1012,
            "website": ""
        },
        {
            "id": 6,
            "name": "Hassan Metal Scrap Center",
            "type": "recycling",
            "address": "H.N. Pura Road, Hassan 573201",
            "phone": "+91 8172 277 890",
            "hours": "8:00 AM - 5:00 PM (Mon-Fri)",
            "services": ["Aluminum", "Copper", "Steel", "Brass"],
            "rating": 4.4,
            "lat": 13.0123,
            "lng": 76.1045,
            "website": ""
        },
        {
            "id": 7,
            "name": "Hassan Clothes Donation Center",
            "type": "donation",
            "address": "Near Malnad College, Hassan 573201",
            "phone": "+91 80502 33445",
            "hours": "9:00 AM - 5:00 PM (Mon-Sat)",
            "services": ["Clothing", "Shoes", "Blankets"],
            "rating": 4.7,
            "lat": 13.0167,
            "lng": 76.0998,
            "website": ""
        },
        {
            "id": 8,
            "name": "Hassan Book Bank",
            "type": "donation",
            "address": "College Road, Hassan 573201",
            "phone": "+91 98455 11223",
            "hours": "10:00 AM - 4:00 PM (Wed-Sun)",
            "services": ["Textbooks", "Novels", "Children Books"],
            "rating": 4.8,
            "lat": 13.0092,
            "lng": 76.1067,
            "website": ""
        },
        {
            "id": 9,
            "name": "Hassan Furniture Reuse Center",
            "type": "donation",
            "address": "K.R. Puram, Hassan 573201",
            "phone": "+91 8172 228 456",
            "hours": "9:30 AM - 5:30 PM (Tue-Sat)",
            "services": ["Furniture", "Home Items", "Utensils"],
            "rating": 4.5,
            "lat": 13.0134,
            "lng": 76.1001,
            "website": ""
        },
        {
            "id": 10,
            "name": "Hassan Medical Waste Facility",
            "type": "special",
            "address": "Near HIMS Hospital, Hassan 573201",
            "phone": "+91 8172 229 432",
            "hours": "24/7 Emergency Service",
            "services": ["Medical Waste", "Syringes", "Medicines"],
            "rating": 4.9,
            "lat": 13.0056,
            "lng": 76.1034,
            "website": ""
        }
    ]
    return jsonify(centers)

@app.route('/user-location', methods=['POST'])
def get_user_location():
    """Get user's current location and find nearby centers"""
    try:
        data = request.json
        user_lat = data.get('lat')
        user_lng = data.get('lng')
        
        if not user_lat or not user_lng:
            return jsonify({"error": "Location coordinates required"}), 400
        
        # Get all centers
        centers_response = get_recycling_centers()
        centers = centers_response.get_json()
        
        # Calculate distances and sort by proximity
        for center in centers:
            distance = calculate_distance(user_lat, user_lng, center['lat'], center['lng'])
            center['distance_km'] = round(distance, 2)
            center['distance'] = f"{round(distance, 2)} km"
        
        # Sort by distance
        centers.sort(key=lambda x: x['distance_km'])
        
        return jsonify({
            "user_location": {"lat": user_lat, "lng": user_lng},
            "nearby_centers": centers,
            "total_centers": len(centers)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two coordinates in kilometers using Haversine formula"""
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth radius in km
    
    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lng = radians(lng2 - lng1)
    
    a = sin(delta_lat/2) * sin(delta_lat/2) + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lng/2) * sin(delta_lng/2)
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c

@app.route('/get-directions/<int:center_id>')
def get_directions(center_id):
    """Get detailed directions to a specific recycling center"""
    centers = get_recycling_centers().get_json()
    center = next((c for c in centers if c['id'] == center_id), None)
    
    if not center:
        return jsonify({"error": "Center not found"}), 404
    
    # Generate directions based on center location
    directions_info = {
        "id": center_id,
        "name": center['name'],
        "address": center['address'],
        "coordinates": {"lat": center['lat'], "lng": center['lng']},
        "directions": generate_directions(center),
        "transport": generate_transport_options(center),
        "landmarks": generate_landmarks(center)
    }
    
    return jsonify(directions_info)

def generate_directions(center):
    """Generate directions based on center location in Hassan"""
    lat, lng = center['lat'], center['lng']
    
    if center['id'] == 1:  # City Municipal Center
        return "From Hassan Bus Stand: Walk towards B.M. Road → Continue straight for 400m → Municipal office on left side"
    elif center['id'] == 2:  # Plastic Collection
        return "From City Center: Take Katihalli Road → After 3km, enter Industrial Area → Look for blue building"
    elif center['id'] == 3:  # E-Waste
        return "From Railway Station: Exit main gate → Turn right → 150m walk → Green building with electronics sign"
    elif center['id'] == 4:  # Paper Recycling
        return "From Salagame Road: Continue past Engineering College → After 500m → White building on right"
    elif center['id'] == 5:  # Glass Collection
        return "From M.G. Road: Near Canara Bank → Yellow building"
    else:
        return f"Located at {center['address']}. Use GPS navigation for best route."

def generate_transport_options(center):
    """Generate transport options based on center location"""
    if center['type'] == 'recycling':
        return ["Auto rickshaw: ₹40-60 from city center", "City bus: Routes 101, 205, 312", "Walking: 10-25 minutes from nearby areas"]
    else:
        return ["Auto rickshaw: ₹30-50 from city center", "City bus: Multiple routes available", "Free pickup available for bulk items"]

def generate_landmarks(center):
    """Generate nearby landmarks in Hassan"""
    if center['id'] == 1:
        return ["Near Hassan Bus Stand", "Opposite City Municipal Office", "Next to State Bank"]
    elif center['id'] == 2:
        return ["In Industrial Area", "Near Katihalli Junction", "Behind KEB Office"]
    elif center['id'] == 3:
        return ["Near Railway Station", "Next to Food Bazaar", "Opposite KSRTC Bus Stand"]
    elif center['id'] == 4:
        return ["Near Malnad College", "Opposite Engineering College", "Next to Coffee Day"]
    elif center['id'] == 5:
        return ["On M.G. Road", "Near Canara Bank", "Opposite Post Office"]
    else:
        return ["Well-known location in Hassan", "Ask locals for directions"]

@app.route('/leaderboard')
def get_leaderboard():
    """Get top users by eco points"""
    try:
        # For demo purposes, return mock leaderboard
        leaderboard = [
            {"username": "EcoChampion", "eco_points": 450, "level": "Eco Champion"},
            {"username": "GreenWarrior", "eco_points": 320, "level": "Eco Warrior"},
            {"username": "EcoStudent", "eco_points": 150, "level": "Eco Warrior"},
            {"username": "EarthFriend", "eco_points": 180, "level": "Eco Friend"},
            {"username": "RecycleMaster", "eco_points": 280, "level": "Eco Warrior"}
        ]
        return jsonify(leaderboard)
    except Exception as e:
        print(f"❌ Error in /leaderboard: {e}")
        return jsonify({"error": "Server error"}), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "EcoWise Backend",
        "timestamp": "2024-01-01T00:00:00Z"
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("🌱 Starting EcoWise Server...")
    app.run(debug=True, port=5000, host='0.0.0.0')