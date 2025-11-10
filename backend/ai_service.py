import cv2
import numpy as np
from ultralytics import YOLO
import os

class EcoWiseAI:
    def __init__(self):
        # Load YOLOv8 model (will download automatically on first run)
        self.model = YOLO('yolov8n.pt')
        print("🤖 YOLOv8 AI Model Loaded Successfully!")
        
        # Common objects for recycling/donation
        self.recyclable_objects = {
            'bottle', 'cup', 'book', 'cell phone', 'laptop', 
            'vase', 'chair', 'teddy bear', 'handbag', 'backpack'
        }
        
        self.donation_objects = {
            'book', 'teddy bear', 'handbag', 'backpack', 'sports ball'
        }
    
    def detect_objects(self, image_path):
        """
        Detect objects in an image using YOLOv8
        Returns: List of detected objects with confidence
        """
        try:
            # Run YOLOv8 inference
            results = self.model(image_path)
            
            detected_items = []
            for result in results:
                for box in result.boxes:
                    # Get object info
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    object_name = self.model.names[class_id]
                    
                    # Only include high-confidence detections
                    if confidence > 0.5:
                        detected_items.append({
                            'name': object_name,
                            'confidence': confidence,
                            'bbox': box.xyxy[0].tolist()  # Bounding box coordinates
                        })
            
            return detected_items
            
        except Exception as e:
            print(f"❌ AI Detection Error: {e}")
            return []
    
    def get_recommendation(self, detected_objects):
        """
        Generate recycling/donation recommendations based on detected objects
        """
        if not detected_objects:
            return "No objects detected. Please try another image."
        
        recommendations = []
        eco_points = 0
        
        for obj in detected_objects:
            obj_name = obj['name']
            confidence = obj['confidence']
            
            if obj_name in self.recyclable_objects:
                if obj_name in self.donation_objects:
                    recommendations.append(f"♻️ Donate the {obj_name} to local NGO")
                    eco_points += 15
                else:
                    recommendations.append(f"♻️ Recycle the {obj_name} at nearest center")
                    eco_points += 10
            else:
                recommendations.append(f"ℹ️ Check local guidelines for {obj_name}")
                eco_points += 5
        
        # Remove duplicates
        unique_recommendations = list(set(recommendations))
        
        return {
            "recommendations": unique_recommendations,
            "eco_points": eco_points,
            "detected_count": len(detected_objects)
        }

# Create global AI instance
ai_engine = EcoWiseAI()