import os
import json
import random

# Mock disease detection without using OpenAI
def analyze_plant_disease(image_base64):
    """
    Analyze plant disease from an image using a simple mock implementation.
    In a real application, this would use a machine learning model.
    
    Args:
        image_base64 (str): Base64 encoded image
        
    Returns:
        tuple: (disease_name, cause, treatment)
    """
    try:
        # Simulate image analysis with a set of common plant diseases
        common_diseases = [
            {
                "disease_name": "Late Blight",
                "cause": "Caused by the fungus Phytophthora infestans. Spreads rapidly in cool, wet weather with temperatures between 10-24°C.",
                "treatment": "Use fungicides containing copper or chlorothalonil. Remove and destroy infected plants. Ensure proper spacing for air circulation. Plant resistant varieties."
            },
            {
                "disease_name": "Powdery Mildew",
                "cause": "Caused by various fungi species. Thrives in humid conditions with moderate temperatures. Poor air circulation contributes to its spread.",
                "treatment": "Apply sulfur-based fungicides or neem oil. Increase plant spacing for better air circulation. Remove and destroy affected leaves. Use resistant varieties when possible."
            },
            {
                "disease_name": "Leaf Spot",
                "cause": "Caused by various fungi or bacteria. Spread through splashing water, contaminated tools, and infected plant debris. Favored by warm, wet conditions.",
                "treatment": "Apply appropriate fungicide for the specific pathogen. Remove and destroy infected plant parts. Avoid overhead watering. Rotate crops. Practice good garden sanitation."
            },
            {
                "disease_name": "Rust",
                "cause": "Caused by fungi in the Pucciniales order. Spreads via wind-borne spores. Alternating wet and dry periods enhance development.",
                "treatment": "Apply fungicides containing myclobutanil or sulfur. Remove infected plant parts. Avoid wetting foliage when watering. Plant resistant varieties. Increase spacing between plants."
            },
            {
                "disease_name": "Bacterial Wilt",
                "cause": "Caused by Ralstonia solanacearum bacteria. Enters through wounds in roots. Survives in soil and is spread through contaminated soil, water, or tools.",
                "treatment": "No effective chemical treatment. Remove and destroy infected plants. Practice crop rotation with non-susceptible plants. Avoid contaminating tools. Use resistant varieties if available."
            }
        ]
        
        # In a real application, we would analyze the image
        # Here we simply return a random disease from our list as a demonstration
        result = random.choice(common_diseases)
        return result["disease_name"], result["cause"], result["treatment"]
    except Exception as e:
        return f"Disease detection error: {str(e)}", "", ""
