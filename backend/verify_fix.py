import os

def verify_frontend_text():
    print("\nVerifying Frontend Text...")
    files = [
        r"C:\Users\Akash\Desktop\ecowise-project\frontend\analyze.html",
        r"C:\Users\Akash\Desktop\ecowise-project\frontend\analyze.js",
        r"C:\Users\Akash\Desktop\ecowise-project\frontend\map.html"
    ]
    
    all_passed = True
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().lower()
                if "tumkur" in content:
                    print(f"Found 'tumkur' in {os.path.basename(file_path)}")
                    all_passed = False
                elif "hassan" not in content:
                     print(f"'hassan' not found in {os.path.basename(file_path)}")
                     all_passed = False
                else:
                    print(f"{os.path.basename(file_path)} verified.")
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            all_passed = False
            
    if all_passed:
        print("All frontend files verified.")

def verify_ai_service():
    print("\nVerifying AI Service Classes...")
    try:
        from ai_service import ai_engine
        
        new_classes = ['keyboard', 'mouse', 'tv', 'microwave', 'chair']
        missing = []
        for cls in new_classes:
            if cls not in ai_engine.recyclable_objects and cls not in ai_engine.donation_objects:
                missing.append(cls)
        
        if not missing:
            print("AI Service classes verified.")
        else:
            print(f"AI Service missing classes: {missing}")
            
    except Exception as e:
        print(f"Error verifying AI service: {e}")

if __name__ == "__main__":
    verify_frontend_text()
    verify_ai_service()
