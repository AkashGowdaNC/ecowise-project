"""
EcoWise AI Service - Enhanced YOLOv8 Object Detection
"""
from ultralytics import YOLO
import os

class EcoWiseAI:
    def __init__(self):
        print("🤖 Initializing EcoWise AI...")
        
        # Load YOLOv8 model
        model_path = 'yolov8n.pt'
        if not os.path.exists(model_path):
            print("⚠️ Model not found, downloading...")
        
        self.model = YOLO(model_path)
        print("✅ YOLOv8 Model Loaded Successfully!")
        
        # Define recyclable and donation objects
        self.recyclable_objects = {
            'bottle', 'cup', 'can', 'wine glass', 'bowl',
            'laptop', 'mouse', 'keyboard', 'cell phone', 'tv', 'remote',
            'book', 'clock', 'vase', 'scissors', 'teddy bear',
            'hair drier', 'toothbrush', 'microwave', 'oven', 'toaster',
            'sink', 'refrigerator', 'potted plant', 'chair', 'couch',
            'bed', 'dining table', 'toilet', 'backpack', 'handbag',
            'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
            'kite', 'baseball bat', 'baseball glove', 'skateboard',
            'surfboard', 'tennis racket'
        }
        
        self.donation_objects = {
            'book', 'laptop', 'cell phone', 'teddy bear', 'backpack',
            'handbag', 'suitcase', 'chair', 'couch', 'bed', 'dining table',
            'potted plant', 'clock', 'vase'
        }
    
    def detect_objects(self, image_path):
        """
        Detect objects in an image using YOLOv8 with improved sensitivity
        """
        try:
            print(f"🔍 Detecting objects in: {image_path}")
            
            # Run detection with lower confidence threshold for better detection
            results = self.model(image_path, conf=0.20)
            
            detected_items = []
            
            # Process results
            for result in results:
                boxes = result.boxes
                names = result.names
                
                for box in boxes:
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    object_name = names[class_id]
                    
                    # Include detections with confidence > 0.20
                    if confidence > 0.20:
                        detected_items.append({
                            'name': object_name,
                            'confidence': confidence,
                            'bbox': box.xyxy[0].tolist()
                        })
                        print(f"   📌 Detected: {object_name} (confidence: {confidence:.2f})")
            
            print(f"✅ Total detected: {len(detected_items)} objects")
            if detected_items:
                print(f"   🎯 Objects: {[item['name'] for item in detected_items]}")
            else:
                print(f"   ⚠️ No objects detected above confidence threshold")
            
            return detected_items
            
        except Exception as e:
            print(f"❌ AI Detection Error: {e}")
            return []
    
    def get_recommendation(self, detected_objects):
        """
        Generate detailed recycling/donation recommendations with categories
        """
        if not detected_objects:
            return {
                "recommendations": ["No objects detected. Please try uploading a clearer image with better lighting."],
                "eco_points": 0,
                "detected_count": 0,
                "categories": {
                    "recyclable": [],
                    "donatable": [],
                    "general": []
                }
            }
        
        recyclable = []
        donatable = []
        general = []
        eco_points = 0
        
        for obj in detected_objects:
            obj_name = obj['name']
            confidence = obj['confidence']
            confidence_pct = int(confidence * 100)
            
            if obj_name in self.recyclable_objects:
                if obj_name in self.donation_objects:
                    donatable.append({
                        "item": obj_name,
                        "action": f"Donate to local NGO or charity ({confidence_pct}% confidence)",
                        "points": 15
                    })
                    eco_points += 15
                else:
                    recyclable.append({
                        "item": obj_name,
                        "action": f"Recycle at nearest recycling center ({confidence_pct}% confidence)",
                        "points": 10
                    })
                    eco_points += 10
            else:
                general.append({
                    "item": obj_name,
                    "action": f"Check local waste guidelines ({confidence_pct}% confidence)",
                    "points": 5
                })
                eco_points += 5
        
        # Build recommendations list
        recommendations = []
        
        if recyclable:
            recommendations.append(f"♻️ RECYCLABLE: {', '.join([r['item'] for r in recyclable])}")
        
        if donatable:
            recommendations.append(f"🤝 DONATABLE: {', '.join([d['item'] for d in donatable])}")
        
        if general:
            recommendations.append(f"ℹ️ CHECK GUIDELINES: {', '.join([g['item'] for g in general])}")
        
        return {
            "recommendations": recommendations if recommendations else ["Objects detected but no specific recommendations available."],
            "eco_points": eco_points,
            "detected_count": len(detected_objects),
            "categories": {
                "recyclable": recyclable,
                "donatable": donatable,
                "general": general
            },
            "details": {
                "total_items": len(detected_objects),
                "recyclable_count": len(recyclable),
                "donatable_count": len(donatable)
            }
        }

# Create global AI instance
ai_engine = EcoWiseAI()