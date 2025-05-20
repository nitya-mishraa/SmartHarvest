/**
 * Voice-Enabled Crop Planning Assistant with Multilingual Support
 * This script handles voice recognition, processing, and response generation
 * for the crop planning assistant feature.
 */

// Global variables
let recognition;
let currentLanguage = 'en-US'; // Default language
let isListening = false;
let speechSynthesis = window.speechSynthesis;
let voiceAssistantActive = false;

// Language mappings for voice recognition and synthesis
const languageMappings = {
    'en': { code: 'en-US', name: 'English' },
    'hi': { code: 'hi-IN', name: 'Hindi' },
    'ta': { code: 'ta-IN', name: 'Tamil' },
    'te': { code: 'te-IN', name: 'Telugu' },
    'bn': { code: 'bn-IN', name: 'Bengali' }
};

// Translations for voice commands and responses
const translations = {
    'en': {
        welcomeMessage: "Welcome to AgriSaarthi voice crop planner. How can I help you with crop planning today?",
        listeningMessage: "Listening...",
        processingMessage: "Processing your request...",
        notUnderstoodMessage: "Sorry, I didn't understand that. Please try again.",
        cropSuggestions: "Based on your soil and climate, I recommend planting: ",
        helpMessage: "You can ask me questions like: What crops are suitable for rainy season? What should I plant in sandy soil? How to prepare for wheat planting?",
        goodbyeMessage: "Thank you for using AgriSaarthi voice crop planner. Goodbye!",
        confirmationMessage: "Would you like more information about these crops?",
        cropPlanMessage: "Here's a simple crop plan for you: ",
        errorMessage: "Sorry, there was an error processing your request. Please try again."
    },
    'hi': {
        welcomeMessage: "आग्रीसारथी वॉयस क्रॉप प्लानर में आपका स्वागत है। आज मैं आपकी फसल योजना में कैसे मदद कर सकता हूं?",
        listeningMessage: "सुन रहा हूं...",
        processingMessage: "आपके अनुरोध पर कार्रवाई कर रहा हूं...",
        notUnderstoodMessage: "क्षमा करें, मुझे समझ नहीं आया। कृपया पुनः प्रयास करें।",
        cropSuggestions: "आपकी मिट्टी और जलवायु के आधार पर, मैं बोने की सिफारिश करता हूं: ",
        helpMessage: "आप मुझसे इस तरह के प्रश्न पूछ सकते हैं: बारिश के मौसम के लिए कौन सी फसलें उपयुक्त हैं? रेतीली मिट्टी में क्या लगाना चाहिए? गेहूं की बुवाई की तैयारी कैसे करें?",
        goodbyeMessage: "आग्रीसारथी वॉयस क्रॉप प्लानर का उपयोग करने के लिए धन्यवाद। अलविदा!",
        confirmationMessage: "क्या आप इन फसलों के बारे में अधिक जानकारी चाहते हैं?",
        cropPlanMessage: "यहां आपके लिए एक सरल फसल योजना है: ",
        errorMessage: "क्षमा करें, आपके अनुरोध को संसाधित करने में कोई त्रुटि हुई। कृपया पुनः प्रयास करें।"
    },
    'ta': {
        welcomeMessage: "AgriSaarthi குரல் பயிர் திட்டமிடலில் வரவேற்கிறோம். இன்று பயிர் திட்டமிடலில் நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
        listeningMessage: "கேட்கிறேன்...",
        processingMessage: "உங்கள் கோரிக்கையை செயலாக்குகிறேன்...",
        notUnderstoodMessage: "மன்னிக்கவும், எனக்கு புரியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
        cropSuggestions: "உங்கள் மண் மற்றும் காலநிலையின் அடிப்படையில், நான் நடவுச் செய்ய பரிந்துரைக்கிறேன்: ",
        helpMessage: "நீங்கள் என்னிடம் இது போன்ற கேள்விகளைக் கேட்கலாம்: மழைக்காலத்திற்கு ஏற்ற பயிர்கள் என்ன? மணல் மண்ணில் என்ன நடவு செய்ய வேண்டும்? கோதுமை நடவுக்கு எவ்வாறு தயாராவது?",
        goodbyeMessage: "AgriSaarthi குரல் பயிர் திட்டமிடலைப் பயன்படுத்தியதற்கு நன்றி. வணக்கம்!",
        confirmationMessage: "இந்த பயிர்களைப் பற்றி மேலும் தகவல் வேண்டுமா?",
        cropPlanMessage: "இதோ உங்களுக்கான ஒரு எளிய பயிர் திட்டம்: ",
        errorMessage: "மன்னிக்கவும், உங்கள் கோரிக்கையை செயலாக்குவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
    },
    'te': {
        welcomeMessage: "AgriSaarthi వాయిస్ క్రాప్ ప్లానర్‌కి స్వాగతం. నేడు నేను మీకు పంట ప్రణాళికలో ఎలా సహాయపడగలను?",
        listeningMessage: "వింటున్నాను...",
        processingMessage: "మీ అభ్యర్థనను ప్రాసెస్ చేస్తున్నాను...",
        notUnderstoodMessage: "క్షమించండి, నాకు అర్థం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
        cropSuggestions: "మీ నేల మరియు వాతావరణం ఆధారంగా, నేను నాటడానికి సిఫారసు చేస్తున్నాను: ",
        helpMessage: "మీరు నన్ను ఇలాంటి ప్రశ్నలు అడగవచ్చు: వర్షాకాలానికి ఏ పంటలు అనుకూలం? ఇసుక నేలలో ఏమి నాటాలి? గోధుమలు నాటడానికి ఎలా సిద్ధం కావాలి?",
        goodbyeMessage: "AgriSaarthi వాయిస్ క్రాప్ ప్లానర్‌ని ఉపయోగించినందుకు ధన్యవాదాలు. వీడ్కోలు!",
        confirmationMessage: "మీరు ఈ పంటల గురించి మరింత సమాచారం కావాలా?",
        cropPlanMessage: "ఇక్కడ మీ కోసం ఒక సాధారణ పంట ప్రణాళిక ఉంది: ",
        errorMessage: "క్షమించండి, మీ అభ్యర్థనను ప్రాసెస్ చేయడంలో లోపం జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి."
    },
    'bn': {
        welcomeMessage: "AgriSaarthi ভয়েস ক্রপ প্ল্যানারে স্বাগতম। আজ আমি কিভাবে আপনাকে ফসল পরিকল্পনায় সাহায্য করতে পারি?",
        listeningMessage: "শুনছি...",
        processingMessage: "আপনার অনুরোধ প্রক্রিয়া করা হচ্ছে...",
        notUnderstoodMessage: "দুঃখিত, আমি বুঝতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।",
        cropSuggestions: "আপনার মাটি এবং জলবায়ুর উপর ভিত্তি করে, আমি রোপণের পরামর্শ দিচ্ছি: ",
        helpMessage: "আপনি আমাকে এই ধরনের প্রশ্ন জিজ্ঞাসা করতে পারেন: বর্ষা মৌসুমের জন্য কোন ফসল উপযুক্ত? বালি মাটিতে কী রোপণ করা উচিত? গম রোপণের জন্য কীভাবে প্রস্তুত হবেন?",
        goodbyeMessage: "AgriSaarthi ভয়েস ক্রপ প্ল্যানার ব্যবহার করার জন্য ধন্যবাদ। বিদায়!",
        confirmationMessage: "আপনি কি এই ফসলগুলি সম্পর্কে আরও তথ্য চান?",
        cropPlanMessage: "এখানে আপনার জন্য একটি সহজ ফসল পরিকল্পনা রয়েছে: ",
        errorMessage: "দুঃখিত, আপনার অনুরোধ প্রক্রিয়া করতে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
    }
};

// Crop information database for recommendations
const cropDatabase = {
    'rice': {
        en: {
            name: 'Rice',
            soil: 'Clayey soil',
            climate: 'Warm and humid',
            season: 'Kharif (monsoon)',
            waterRequirement: 'High',
            growthPeriod: '120-150 days'
        },
        hi: {
            name: 'चावल',
            soil: 'चिकनी मिट्टी',
            climate: 'गर्म और नम',
            season: 'खरीफ (मानसून)',
            waterRequirement: 'अधिक',
            growthPeriod: '120-150 दिन'
        },
        ta: {
            name: 'அரிசி',
            soil: 'களிமண்',
            climate: 'வெப்பமான மற்றும் ஈரப்பதமான',
            season: 'காரிஃப் (பருவமழை)',
            waterRequirement: 'அதிகம்',
            growthPeriod: '120-150 நாட்கள்'
        },
        te: {
            name: 'వరి',
            soil: 'బంకమట్టి',
            climate: 'వేడి మరియు తేమతో కూడిన',
            season: 'ఖరీఫ్ (రుతుపవనాలు)',
            waterRequirement: 'ఎక్కువ',
            growthPeriod: '120-150 రోజులు'
        },
        bn: {
            name: 'ধান',
            soil: 'কাদামাটি',
            climate: 'উষ্ণ ও আর্দ্র',
            season: 'খরিফ (বর্ষা)',
            waterRequirement: 'উচ্চ',
            growthPeriod: '120-150 দিন'
        }
    },
    'wheat': {
        en: {
            name: 'Wheat',
            soil: 'Loamy soil',
            climate: 'Cool',
            season: 'Rabi (winter)',
            waterRequirement: 'Medium',
            growthPeriod: '100-130 days'
        },
        hi: {
            name: 'गेहूं',
            soil: 'दोमट मिट्टी',
            climate: 'ठंडा',
            season: 'रबी (सर्दी)',
            waterRequirement: 'मध्यम',
            growthPeriod: '100-130 दिन'
        },
        ta: {
            name: 'கோதுமை',
            soil: 'வண்டல் மண்',
            climate: 'குளிர்',
            season: 'ரபி (குளிர்காலம்)',
            waterRequirement: 'மத்தியம்',
            growthPeriod: '100-130 நாட்கள்'
        },
        te: {
            name: 'గోధుమ',
            soil: 'లోమీ మట్టి',
            climate: 'చల్లని',
            season: 'రబీ (శీతాకాలం)',
            waterRequirement: 'మధ్యస్థం',
            growthPeriod: '100-130 రోజులు'
        },
        bn: {
            name: 'গম',
            soil: 'দোআঁশ মাটি',
            climate: 'শীতল',
            season: 'রবি (শীত)',
            waterRequirement: 'মাঝারি',
            growthPeriod: '100-130 দিন'
        }
    },
    'maize': {
        en: {
            name: 'Maize',
            soil: 'Well-drained loamy soil',
            climate: 'Warm',
            season: 'Kharif and Rabi',
            waterRequirement: 'Medium',
            growthPeriod: '90-120 days'
        },
        hi: {
            name: 'मक्का',
            soil: 'अच्छी जल निकासी वाली दोमट मिट्टी',
            climate: 'गर्म',
            season: 'खरीफ और रबी',
            waterRequirement: 'मध्यम',
            growthPeriod: '90-120 दिन'
        },
        ta: {
            name: 'மக்காச்சோளம்',
            soil: 'நல்ல வடிகால் கொண்ட வண்டல் மண்',
            climate: 'வெப்பமான',
            season: 'காரிஃப் மற்றும் ரபி',
            waterRequirement: 'மத்தியம்',
            growthPeriod: '90-120 நாட்கள்'
        },
        te: {
            name: 'మొక్కజొన్న',
            soil: 'మంచి నీటిపారుదల గల లోమీ నేల',
            climate: 'వేడి',
            season: 'ఖరీఫ్ మరియు రబీ',
            waterRequirement: 'మధ్యస్థం',
            growthPeriod: '90-120 రోజులు'
        },
        bn: {
            name: 'ভুট্টা',
            soil: 'ভালো জল নিষ্কাশন সহ দোআঁশ মাটি',
            climate: 'উষ্ণ',
            season: 'খরিফ এবং রবি',
            waterRequirement: 'মাঝারি',
            growthPeriod: '90-120 দিন'
        }
    },
    'cotton': {
        en: {
            name: 'Cotton',
            soil: 'Black soil (regur)',
            climate: 'Warm and dry',
            season: 'Kharif',
            waterRequirement: 'Medium to high',
            growthPeriod: '160-180 days'
        },
        hi: {
            name: 'कपास',
            soil: 'काली मिट्टी (रेगुर)',
            climate: 'गर्म और शुष्क',
            season: 'खरीफ',
            waterRequirement: 'मध्यम से अधिक',
            growthPeriod: '160-180 दिन'
        },
        ta: {
            name: 'பருத்தி',
            soil: 'கருப்பு மண் (ரேகுர்)',
            climate: 'வெப்பமான மற்றும் வறண்ட',
            season: 'காரிஃப்',
            waterRequirement: 'மத்தியம் முதல் அதிகம் வரை',
            growthPeriod: '160-180 நாட்கள்'
        },
        te: {
            name: 'పత్తి',
            soil: 'నల్ల నేల (రేగుర్)',
            climate: 'వేడి మరియు పొడి',
            season: 'ఖరీఫ్',
            waterRequirement: 'మధ్యస్థం నుండి ఎక్కువ',
            growthPeriod: '160-180 రోజులు'
        },
        bn: {
            name: 'তুলা',
            soil: 'কালো মাটি (রেগুর)',
            climate: 'উষ্ণ এবং শুষ্ক',
            season: 'খরিফ',
            waterRequirement: 'মাঝারি থেকে উচ্চ',
            growthPeriod: '160-180 দিন'
        }
    },
    'sugarcane': {
        en: {
            name: 'Sugarcane',
            soil: 'Loamy soil',
            climate: 'Tropical and subtropical',
            season: 'Year-round',
            waterRequirement: 'High',
            growthPeriod: '10-12 months'
        },
        hi: {
            name: 'गन्ना',
            soil: 'दोमट मिट्टी',
            climate: 'उष्णकटिबंधीय और उपोष्णकटिबंधीय',
            season: 'साल भर',
            waterRequirement: 'अधिक',
            growthPeriod: '10-12 महीने'
        },
        ta: {
            name: 'கரும்பு',
            soil: 'வண்டல் மண்',
            climate: 'வெப்பமண்டல மற்றும் துணை வெப்பமண்டல',
            season: 'ஆண்டு முழுவதும்',
            waterRequirement: 'அதிகம்',
            growthPeriod: '10-12 மாதங்கள்'
        },
        te: {
            name: 'చెరకు',
            soil: 'లోమీ మట్టి',
            climate: 'ఉష్ణమండల మరియు ఉపోష్ణమండల',
            season: 'సంవత్సరం పొడవునా',
            waterRequirement: 'ఎక్కువ',
            growthPeriod: '10-12 నెలలు'
        },
        bn: {
            name: 'আখ',
            soil: 'দোআঁশ মাটি',
            climate: 'ক্রান্তীয় ও উপক্রান্তীয়',
            season: 'সারা বছর',
            waterRequirement: 'উচ্চ',
            growthPeriod: '10-12 মাস'
        }
    }
};

/**
 * Initialize the voice assistant
 */
function initVoiceCropPlanner() {
    setupSpeechRecognition();
    setupEventListeners();
    updateLanguageSelectionUI();
}

/**
 * Setup speech recognition with appropriate language settings
 */
function setupSpeechRecognition() {
    try {
        // Check if browser supports speech recognition
        if (!('webkitSpeechRecognition' in window)) {
            showError("Speech recognition is not supported in your browser. Please try Chrome.");
            return;
        }

        // Initialize speech recognition
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = currentLanguage;

        // Add speech recognition event handlers
        recognition.onstart = function() {
            isListening = true;
            updateMicrophoneUI(true);
            showListeningStatus(getTranslation('listeningMessage'));
        };

        recognition.onresult = function(event) {
            isListening = false;
            updateMicrophoneUI(false);
            
            const transcript = event.results[0][0].transcript.trim().toLowerCase();
            processVoiceCommand(transcript);
        };

        recognition.onerror = function(event) {
            isListening = false;
            updateMicrophoneUI(false);
            showError("Error in speech recognition: " + event.error);
        };

        recognition.onend = function() {
            isListening = false;
            updateMicrophoneUI(false);
        };
    } catch (error) {
        showError("Error setting up speech recognition: " + error.message);
    }
}

/**
 * Setup event listeners for voice assistant UI elements
 */
function setupEventListeners() {
    // Setup microphone button click event
    const microphoneButton = document.getElementById('voice-assist-mic');
    if (microphoneButton) {
        microphoneButton.addEventListener('click', toggleListening);
    }

    // Setup language selector change event
    const languageSelector = document.getElementById('voice-language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function(e) {
            const langCode = e.target.value;
            changeLanguage(langCode);
        });
    }

    // Setup help button
    const helpButton = document.getElementById('voice-assist-help');
    if (helpButton) {
        helpButton.addEventListener('click', showHelpInformation);
    }

    // Setup cancel button to stop speech
    const cancelButton = document.getElementById('voice-assist-cancel');
    if (cancelButton) {
        cancelButton.addEventListener('click', stopSpeaking);
    }

    // Add keyboard shortcut for activating voice assistant
    document.addEventListener('keydown', function(e) {
        // Alt + M to toggle microphone
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            toggleListening();
        }
        
        // Escape key to stop speaking
        if (e.key === 'Escape') {
            stopSpeaking();
        }
    });
}

/**
 * Toggle listening state of voice assistant
 */
function toggleListening() {
    if (!voiceAssistantActive) {
        activateVoiceAssistant();
        return;
    }

    if (isListening) {
        recognition.stop();
        isListening = false;
        updateMicrophoneUI(false);
    } else {
        try {
            recognition.start();
        } catch (error) {
            // If there's an error starting recognition, reset and try again
            setTimeout(() => {
                recognition.start();
            }, 200);
        }
    }
}

/**
 * Activate the voice assistant for the first time
 */
function activateVoiceAssistant() {
    voiceAssistantActive = true;
    showVoiceAssistantInterface();
    
    // Greet the user
    speakText(getTranslation('welcomeMessage'));
    
    // After greeting, start listening
    setTimeout(() => {
        toggleListening();
    }, 1000);
}

/**
 * Process voice command from the user
 * @param {string} command - Voice command text
 */
function processVoiceCommand(command) {
    showProcessingMessage(getTranslation('processingMessage'));
    
    // Log the command for debugging
    console.log("Voice command received:", command);
    
    // Process commands based on language and context
    const languageCode = currentLanguage.split('-')[0];
    
    // Analyze the command to determine intent
    if (command.length === 0) {
        speakText(getTranslation('notUnderstoodMessage'));
        return;
    }
    
    try {
        // Generate crop recommendation based on user's command
        const recommendation = generateCropRecommendation(command, languageCode);
        
        // Display and speak the recommendation
        displayCropRecommendation(recommendation);
        speakText(recommendation.spoken);
    } catch (error) {
        showError(getTranslation('errorMessage'));
        console.error("Error processing command:", error);
    }
}

/**
 * Generate crop recommendation based on user command
 * @param {string} command - User's voice command
 * @param {string} languageCode - Current language code (en, hi, etc.)
 * @returns {Object} Recommendation with detailed and spoken components
 */
function generateCropRecommendation(command, languageCode) {
    // Extract key information from the command
    const soilTypes = {
        'en': ['sandy', 'clayey', 'loamy', 'black', 'red', 'alluvial'],
        'hi': ['रेतीली', 'चिकनी', 'दोमट', 'काली', 'लाल', 'जलोढ़'],
        'ta': ['மணல்', 'களிமண்', 'வண்டல்', 'கருப்பு', 'சிவப்பு', 'வண்டல்'],
        'te': ['ఇసుక', 'బంక', 'లోమీ', 'నల్ల', 'ఎరుపు', 'ఒండ్రు'],
        'bn': ['বালু', 'কাদা', 'দোআঁশ', 'কালো', 'লাল', 'পলি']
    };

    const seasons = {
        'en': ['summer', 'winter', 'monsoon', 'rainy', 'kharif', 'rabi'],
        'hi': ['गर्मी', 'सर्दी', 'मानसून', 'बारिश', 'खरीफ', 'रबी'],
        'ta': ['கோடை', 'குளிர்', 'பருவமழை', 'மழை', 'காரிஃப்', 'ரபி'],
        'te': ['వేసవి', 'శీతాకాలం', 'రుతుపవనాలు', 'వర్షాకాలం', 'ఖరీఫ్', 'రబీ'],
        'bn': ['গ্রীষ্ম', 'শীত', 'মৌসুমী', 'বর্ষা', 'খরিফ', 'রবি']
    };

    const waterAvailability = {
        'en': ['dry', 'irrigated', 'rain-fed', 'drought', 'water', 'irrigation'],
        'hi': ['सूखा', 'सिंचित', 'वर्षा-आधारित', 'सूखा', 'पानी', 'सिंचाई'],
        'ta': ['வறண்ட', 'நீர்ப்பாசனம்', 'மழை சார்ந்த', 'வறட்சி', 'நீர்', 'பாசனம்'],
        'te': ['పొడి', 'నీటిపారుదల', 'వర్షాధారిత', 'కరువు', 'నీరు', 'నీటిపారుదల'],
        'bn': ['শুষ্ক', 'সেচযুক্ত', 'বৃষ্টি-নির্ভর', 'খরা', 'জল', 'সেচ']
    };

    // Analyze command to determine soil, season, water availability
    let detectedSoil = null;
    let detectedSeason = null;
    let detectedWater = null;

    // Check for soil type matches
    soilTypes[languageCode].forEach(soil => {
        if (command.includes(soil.toLowerCase())) {
            detectedSoil = soil;
        }
    });

    // Check for season matches
    seasons[languageCode].forEach(season => {
        if (command.includes(season.toLowerCase())) {
            detectedSeason = season;
        }
    });

    // Check for water availability matches
    waterAvailability[languageCode].forEach(water => {
        if (command.includes(water.toLowerCase())) {
            detectedWater = water;
        }
    });

    // Generate recommendations based on detected parameters
    let recommendedCrops = [];
    let reasonForRecommendation = '';

    // Simple rule-based recommendation system
    if (detectedSoil === soilTypes[languageCode][0]) { // Sandy soil
        recommendedCrops = ['maize', 'cotton'];
        reasonForRecommendation = 'sandy soil';
    } else if (detectedSoil === soilTypes[languageCode][1]) { // Clayey soil
        recommendedCrops = ['rice'];
        reasonForRecommendation = 'clayey soil';
    } else if (detectedSoil === soilTypes[languageCode][2]) { // Loamy soil
        recommendedCrops = ['wheat', 'sugarcane', 'maize'];
        reasonForRecommendation = 'loamy soil';
    } else if (detectedSoil === soilTypes[languageCode][3]) { // Black soil
        recommendedCrops = ['cotton', 'sugarcane'];
        reasonForRecommendation = 'black soil';
    } else if (detectedSeason === seasons[languageCode][0] || detectedSeason === seasons[languageCode][4]) { // Summer or Kharif
        recommendedCrops = ['rice', 'maize', 'cotton'];
        reasonForRecommendation = 'summer/kharif season';
    } else if (detectedSeason === seasons[languageCode][1] || detectedSeason === seasons[languageCode][5]) { // Winter or Rabi
        recommendedCrops = ['wheat'];
        reasonForRecommendation = 'winter/rabi season';
    } else if (detectedSeason === seasons[languageCode][2] || detectedSeason === seasons[languageCode][3]) { // Monsoon or Rainy
        recommendedCrops = ['rice'];
        reasonForRecommendation = 'monsoon/rainy season';
    } else if (detectedWater === waterAvailability[languageCode][0] || detectedWater === waterAvailability[languageCode][3]) { // Dry or Drought
        recommendedCrops = ['maize', 'cotton'];
        reasonForRecommendation = 'limited water availability';
    } else if (detectedWater === waterAvailability[languageCode][1] || detectedWater === waterAvailability[languageCode][5]) { // Irrigated or Irrigation
        recommendedCrops = ['rice', 'sugarcane'];
        reasonForRecommendation = 'good irrigation facilities';
    } else {
        // Default recommendations if no specific condition is detected
        recommendedCrops = ['wheat', 'maize', 'rice'];
        reasonForRecommendation = 'general cultivation';
    }

    // Create detailed recommendation
    const cropNames = recommendedCrops.map(crop => cropDatabase[crop][languageCode].name).join(', ');
    const spoken = `${getTranslation('cropSuggestions')} ${cropNames} ${getTranslation('cropPlanMessage')}`;
    
    // Build detailed recommendation with crop details
    let detailed = `<h4>${getTranslation('cropSuggestions')}</h4><ul>`;
    recommendedCrops.forEach(crop => {
        const cropInfo = cropDatabase[crop][languageCode];
        detailed += `<li><strong>${cropInfo.name}</strong> - ${cropInfo.soil}, ${cropInfo.climate}, ${cropInfo.season}</li>`;
    });
    detailed += `</ul>`;
    
    // Add crop plan
    detailed += `<h4>${getTranslation('cropPlanMessage')}</h4>`;
    detailed += `<p>Based on ${reasonForRecommendation}, we recommend planning for:</p><ul>`;
    recommendedCrops.forEach(crop => {
        const cropInfo = cropDatabase[crop][languageCode];
        detailed += `<li><strong>${cropInfo.name}</strong>: Growth period ${cropInfo.growthPeriod}, Water requirement: ${cropInfo.waterRequirement}</li>`;
    });
    detailed += `</ul>`;

    return {
        spoken,
        detailed,
        crops: recommendedCrops
    };
}

/**
 * Display crop recommendation in the UI
 * @param {Object} recommendation - Recommendation object with detailed information
 */
function displayCropRecommendation(recommendation) {
    const resultContainer = document.getElementById('voice-assistant-result');
    if (resultContainer) {
        resultContainer.innerHTML = recommendation.detailed;
        resultContainer.style.display = 'block';
    }
}

/**
 * Show help information for voice assistant
 */
function showHelpInformation() {
    const helpMessage = getTranslation('helpMessage');
    speakText(helpMessage);
    
    const resultContainer = document.getElementById('voice-assistant-result');
    if (resultContainer) {
        resultContainer.innerHTML = `<div class="alert alert-info">${helpMessage}</div>`;
        resultContainer.style.display = 'block';
    }
}

/**
 * Change the language for voice recognition and synthesis
 * @param {string} langCode - Language code (en, hi, ta, te, bn)
 */
function changeLanguage(langCode) {
    if (languageMappings[langCode]) {
        currentLanguage = languageMappings[langCode].code;
        
        // Update recognition language
        if (recognition) {
            recognition.lang = currentLanguage;
        }
        
        // Update UI
        updateLanguageSelectionUI();
        
        // Notify user
        const langName = languageMappings[langCode].name;
        showMessage(`Language changed to ${langName}`);
    }
}

/**
 * Update language selection UI to reflect current language
 */
function updateLanguageSelectionUI() {
    const languageSelector = document.getElementById('voice-language-selector');
    if (languageSelector) {
        const currentLangCode = currentLanguage.split('-')[0];
        languageSelector.value = currentLangCode;
    }
}

/**
 * Use speech synthesis to speak text in the current language
 * @param {string} text - Text to speak
 */
function speakText(text) {
    if (!speechSynthesis) {
        console.error("Speech synthesis not supported");
        return;
    }
    
    // Cancel any ongoing speech
    stopSpeaking();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage;
    utterance.rate = 0.9; // Slightly slower than normal for better understanding
    
    // Show speaking indicator
    showSpeakingIndicator(true);
    
    // Start speaking
    speechSynthesis.speak(utterance);
    
    // Update UI when done speaking
    utterance.onend = function() {
        showSpeakingIndicator(false);
    };
}

/**
 * Stop the current speech synthesis
 */
function stopSpeaking() {
    if (speechSynthesis) {
        speechSynthesis.cancel();
        showSpeakingIndicator(false);
    }
}

/**
 * Show the voice assistant interface
 */
function showVoiceAssistantInterface() {
    const assistantContainer = document.getElementById('voice-assistant-container');
    if (assistantContainer) {
        assistantContainer.classList.remove('d-none');
        assistantContainer.classList.add('d-block');
    }
}

/**
 * Update microphone UI to show listening state
 * @param {boolean} isActive - Whether microphone is active
 */
function updateMicrophoneUI(isActive) {
    const micButton = document.getElementById('voice-assist-mic');
    if (micButton) {
        if (isActive) {
            micButton.classList.add('btn-danger');
            micButton.classList.remove('btn-primary');
            micButton.innerHTML = '<i class="fas fa-microphone"></i> ' + getTranslation('listeningMessage');
        } else {
            micButton.classList.remove('btn-danger');
            micButton.classList.add('btn-primary');
            micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }
}

/**
 * Show listening status message
 * @param {string} message - Status message
 */
function showListeningStatus(message) {
    const statusElement = document.getElementById('voice-assist-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.display = 'block';
    }
}

/**
 * Show processing message
 * @param {string} message - Processing message
 */
function showProcessingMessage(message) {
    const statusElement = document.getElementById('voice-assist-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    console.error(message);
    const statusElement = document.getElementById('voice-assist-status');
    if (statusElement) {
        statusElement.textContent = '';
    }
    
    const resultContainer = document.getElementById('voice-assistant-result');
    if (resultContainer) {
        resultContainer.innerHTML = `<div class="alert alert-danger">${message}</div>`;
        resultContainer.style.display = 'block';
    }
}

/**
 * Show general message
 * @param {string} message - General message
 */
function showMessage(message) {
    const resultContainer = document.getElementById('voice-assistant-result');
    if (resultContainer) {
        resultContainer.innerHTML = `<div class="alert alert-info">${message}</div>`;
        resultContainer.style.display = 'block';
    }
}

/**
 * Show or hide speaking indicator
 * @param {boolean} isSpeaking - Whether system is speaking
 */
function showSpeakingIndicator(isSpeaking) {
    const speakingIndicator = document.getElementById('voice-assist-speaking');
    if (speakingIndicator) {
        speakingIndicator.style.display = isSpeaking ? 'inline-block' : 'none';
    }
}

/**
 * Get translation for a key in the current language
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
function getTranslation(key) {
    const langCode = currentLanguage.split('-')[0];
    if (translations[langCode] && translations[langCode][key]) {
        return translations[langCode][key];
    }
    return translations['en'][key]; // Fallback to English
}

// Initialize voice assistant when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the crop planning page
    if (document.getElementById('voice-assistant-container')) {
        initVoiceCropPlanner();
    }
});