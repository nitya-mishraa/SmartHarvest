import os
import requests
import json

# Google Translate API key
GOOGLE_TRANSLATE_API_KEY = os.environ.get("GOOGLE_TRANSLATE_API_KEY")

def translate_text(text, target_language='en'):
    """
    Translate text using Google Translate API.
    
    Args:
        text (str): Text to translate
        target_language (str): Target language code (e.g., 'hi' for Hindi, 'ta' for Tamil)
        
    Returns:
        str: Translated text
    """
    if not text:
        return ""
        
    # If no API key is provided, return the original text
    if not GOOGLE_TRANSLATE_API_KEY:
        return text
        
    try:
        url = f"https://translation.googleapis.com/language/translate/v2?key={GOOGLE_TRANSLATE_API_KEY}"
        
        payload = {
            "q": text,
            "target": target_language
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            return result["data"]["translations"][0]["translatedText"]
        else:
            return text  # Return original text if translation fails
            
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return text  # Return original text if translation fails

# Dictionary of supported languages with their codes
SUPPORTED_LANGUAGES = {
    "English": "en",
    "Hindi": "hi",
    "Tamil": "ta",
    "Telugu": "te",
    "Bengali": "bn",
    "Marathi": "mr",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Punjabi": "pa",
    "Urdu": "ur"
}
