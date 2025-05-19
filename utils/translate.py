import os

# Simple translation system with predefined phrases
# This doesn't require an external API

# Common phrases dictionary for agricultural terms
TRANSLATIONS = {
    # English phrases
    "en": {
        "welcome": "Welcome to AgriSaarthi",
        "crop_recommendation": "Crop Recommendation",
        "fertilizer_recommendation": "Fertilizer Recommendation",
        "disease_detection": "Disease Detection",
        "farm_diary": "Farm Diary",
        "task_planner": "Task Planner",
        "knowledge_hub": "Knowledge Hub",
        "login": "Login",
        "register": "Register",
        "logout": "Logout",
        "profile": "Profile",
        "home": "Home",
        "submit": "Submit",
        "cancel": "Cancel",
        "save": "Save",
        "delete": "Delete",
        "edit": "Edit",
    },
    # Hindi phrases
    "hi": {
        "welcome": "अग्रिसारथी में आपका स्वागत है",
        "crop_recommendation": "फसल अनुशंसा",
        "fertilizer_recommendation": "उर्वरक अनुशंसा",
        "disease_detection": "रोग पहचान",
        "farm_diary": "खेत डायरी",
        "task_planner": "कार्य योजना",
        "knowledge_hub": "ज्ञान केंद्र",
        "login": "लॉगिन",
        "register": "पंजीकरण",
        "logout": "लॉगआउट",
        "profile": "प्रोफाइल",
        "home": "होम",
        "submit": "जमा करें",
        "cancel": "रद्द करें",
        "save": "सहेजें",
        "delete": "हटाएं",
        "edit": "संपादित करें",
    },
    # Tamil phrases
    "ta": {
        "welcome": "அக்ரிசாரதிக்கு வரவேற்கிறோம்",
        "crop_recommendation": "பயிர் பரிந்துரை",
        "fertilizer_recommendation": "உர பரிந்துரை",
        "disease_detection": "நோய் கண்டறிதல்",
        "farm_diary": "பண்ணை நாட்குறிப்பு",
        "task_planner": "பணி திட்டமிடல்",
        "knowledge_hub": "அறிவு மையம்",
        "login": "உள்நுழைய",
        "register": "பதிவு செய்யவும்",
        "logout": "வெளியேறு",
        "profile": "சுயவிவரம்",
        "home": "முகப்பு",
        "submit": "சமர்ப்பிக்கவும்",
        "cancel": "ரத்து செய்",
        "save": "சேமி",
        "delete": "நீக்கு",
        "edit": "திருத்து",
    },
    # Telugu phrases
    "te": {
        "welcome": "అగ్రిసారథికి స్వాగతం",
        "crop_recommendation": "పంట సిఫార్సు",
        "fertilizer_recommendation": "ఎరువుల సిఫార్సు",
        "disease_detection": "వ్యాధి గుర్తింపు",
        "farm_diary": "వ్యవసాయ డైరీ",
        "task_planner": "పని ప్రణాళిక",
        "knowledge_hub": "జ్ఞాన కేంద్రం",
        "login": "లాగిన్",
        "register": "నమోదు",
        "logout": "లాగౌట్",
        "profile": "ప్రొఫైల్",
        "home": "హోమ్",
        "submit": "సమర్పించండి",
        "cancel": "రద్దు చేయండి",
        "save": "సేవ్ చేయండి",
        "delete": "తొలగించండి",
        "edit": "సవరించండి",
    },
    # Bengali phrases
    "bn": {
        "welcome": "অগ্রিসারথিতে আপনাকে স্বাগতম",
        "crop_recommendation": "ফসল সুপারিশ",
        "fertilizer_recommendation": "সার সুপারিশ",
        "disease_detection": "রোগ সনাক্তকরণ",
        "farm_diary": "খামার ডায়েরি",
        "task_planner": "কাজ পরিকল্পনাকারী",
        "knowledge_hub": "জ্ঞান কেন্দ্র",
        "login": "লগইন",
        "register": "নিবন্ধন",
        "logout": "লগআউট",
        "profile": "প্রোফাইল",
        "home": "হোম",
        "submit": "জমা দিন",
        "cancel": "বাতিল করুন",
        "save": "সংরক্ষণ করুন",
        "delete": "মুছুন",
        "edit": "সম্পাদনা করুন",
    },
}

def translate_text(text, target_language='en'):
    """
    Translate text using predefined translations.
    
    Args:
        text (str): Text to translate
        target_language (str): Target language code (e.g., 'hi' for Hindi, 'ta' for Tamil)
        
    Returns:
        str: Translated text
    """
    if not text:
        return ""
    
    # Default to English if target language not supported
    if target_language not in TRANSLATIONS:
        target_language = 'en'
    
    # Look up the text in our translations dictionary
    for key, translated_text in TRANSLATIONS[target_language].items():
        if text.lower() == key.lower():
            return translated_text
        
    # If we don't have a translation, return the original text
    return text

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
