from simple_ai import ai_engine

print("🔍 Checking available methods in AI engine:")
print("Methods:", [method for method in dir(ai_engine) if not method.startswith('_')])
print("Type:", type(ai_engine))

# Test if we can create detection
try:
    result = ai_engine.detect_from_filename("test_bottle.jpg")
    print("✅ detect_from_filename works")
    print("Sample result:", result)
except Exception as e:
    print("❌ detect_from_filename failed:", e)

# Try to find recommendation method
if hasattr(ai_engine, 'get_recommendation'):
    print("✅ get_recommendation method exists")
elif hasattr(ai_engine, 'get_smart_recommendations'):
    print("✅ get_smart_recommendations method exists")
else:
    print("❌ No recommendation method found")