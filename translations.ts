export const translations = {
  en: {
    app: {
      title: 'KathaKoli AI',
    },
    sidebar: {
      title: 'AI Suite',
      chatbot: 'AI Conversation',
      image_analyzer: 'Analyze Image',
      image_generator: 'Generate Image',
      video_analyzer: 'Analyze Video',
      text_to_speech: 'Text to Speech',
      ai_therapist: 'AI Therapist',
      idea_generator: 'Idea Generator',
    },
    login: {
      welcome: "",
      placeholder: "Enter your email or phone number",
      button: "Sign In / Sign Up",
      logout: "Logout",
    },
    chatbot: {
      placeholder: "Ask me anything...",
      send: "Send",
      thinkingMode: "Thinking Mode",
      grounding: "Grounding",
      sources: "Sources",
      error: "An error occurred. Please try again.",
      locationError: "Could not get location. Please enable location services.",
      speechError: "Speech recognition error",
      tts: "TTS",
      enableTts: "Enable text-to-speech",
      disableTts: "Disable text-to-speech",
      textMode: "Text Mode",
      voiceMode: "Voice Mode",
      toggleLanguage: "Switch Language",
      stopGenerating: "Stop Generating",
      shareConversation: "Share Conversation",
      copyMessage: "Copy Message",
      copied: "Copied!",
      emptyStateTitle: "Start a conversation",
      emptyStateSubtitle: "Try asking one of these:",
      clearChat: "Clear Chat",
      clearChatConfirmation: "Are you sure you want to clear the entire conversation? This action cannot be undone.",
      exampleQuestions: [
        "What are some interesting places to visit in Bangladesh?",
        "Write a short science fiction story about a robot.",
        "How can I improve my daily productivity?",
        "Explain Quantum Computing in simple terms.",
        "Give me a healthy 7-day meal plan for a vegetarian."
      ]
    },
    imageAnalyzer: {
        title: "Analyze Image",
        description: "Upload an image to unlock a world of information. Gemini can identify objects, read text, and provide detailed descriptions and insights.",
        selectImage: "Select Image",
        analyze: "Analyze Image",
        analyzing: "Analyzing Image...",
        resultTitle: "Analysis Results",
        error: "Failed to analyze image. Please try again.",
        placeholder: "Drag and drop an image here or click to select",
        clear: "Clear"
    },
    imageGenerator: {
        title: "Generate Image",
        description: "Bring your imagination to life. Describe any scene or concept, and watch as Imagen-4 creates stunning, high-quality images from your text prompts.",
        placeholder: "e.g., A photorealistic image of a cat wearing a tiny astronaut helmet, looking at the stars...",
        generate: "Generate Image",
        generating: "Generating...",
        error: "Could not generate image. Please try again.",
        try_examples: "Or try an example:",
        examples: "A cinematic shot of a coffee shop on a rainy day.\nA vibrant, detailed illustration of a mythical forest.\nA raccoon solving a Rubik's cube, award-winning photography."
    },
    videoAnalyzer: {
        title: "Analyze Video",
        description: "Let Gemini Pro watch and understand your videos. Get summaries, identify key moments, and extract valuable information from video content effortlessly."
    },
    videoGenerator: {
        title: "Generate Video",
        description: "Become a video creator. Generate captivating video clips from text prompts or still images using the power of Veo, Google's advanced video generation model.",
        placeholder: "e.g., An epic drone shot of a futuristic city at sunset, with flying cars weaving through holographic billboards...",
        generate: "Generate Video",
        generating: "Generating...",
        error: "Could not generate video. Please try again.",
        try_examples: "Or try an example:",
        selectKeyTitle: "API Key Required",
        selectKeyDescription: "Video generation with Veo requires a Google Cloud API key.",
        selectKeyButton: "Select API Key",
        billingInfo: "Project billing must be enabled to use this feature.",
        learnMore: "Learn More",
        apiKeyError: "Invalid API Key. Please select a valid key with the Generative AI API enabled.",
        loadingMessages: "Warming up the flux capacitor...\nPolishing the camera lens...\nTeaching pixels to dance...\nRendering a masterpiece...\nAlmost there, adding the final touches...",
        loadingComplete: "Your video is ready!",
        examples: "A majestic lion shaking its mane in slow motion.\nA time-lapse of a flower blooming, from bud to full blossom.\nA Shiba Inu dog wearing a party hat and blowing a noisemaker."
    },
    textToSpeech: {
        title: "Text to Speech",
        description: "Convert written text into natural-sounding, high-quality audio. Perfect for listening to articles, creating voiceovers, or improving accessibility.",
        placeholder: "Type or paste text here...",
        generate: "Generate Speech",
        generating: "Generating...",
        error: "Could not generate speech. Please try again.",
        try_examples: "Or try an example:",
        examples: "Hello, world! Welcome to the future of AI.\nTo be, or not to be, that is the question.",
        voice: "Voice",
        rate: "Speed",
        pitch: "Pitch",
        voices: {
            puck: 'Puck (Standard Male)',
            charon: 'Charon (Deep Male)',
            kore: 'Kore (Standard Female)',
            fenrir: 'Fenrir (Deep Male 2)',
            zephyr: 'Zephyr (Friendly Male)',
        }
    },
    liveConversation: {
        title: "Live Conversation",
        description: "Experience the future of interaction. Have a fluid, real-time voice conversation with Gemini 2.5 Native Audio and get responses instantly.",
        systemInstruction: "You are a friendly and helpful conversational AI assistant.",
        start: "Start Conversation",
        stop: "Stop Conversation",
        listening: "Listening...",
        mute: "Mute voice",
        unmute: "Unmute voice",
        you: "You",
        ai: "AI",
        status: {
          connecting: "Connecting...",
          connected: "Connected. Start speaking.",
          error: "An error occurred. Please try again.",
          "not-allowed": "Microphone access denied. Please allow microphone access in your browser settings.",
          "no-speech": "No speech was detected. Please try again.",
          "service-not-allowed": "Microphone access denied by your device or browser.",
          disconnected: "Disconnected. Click Start to begin.",
        }
    },
    aiTherapist: {
        title: "AI Therapist",
        description: "A safe space to talk. This AI is designed to be a caring, empathetic listener to support your well-being. This is not a substitute for professional medical advice.",
        systemInstruction: "You are a caring and empathetic therapist. Your goal is to listen, provide support, and help the user explore their feelings. Start by gently asking them how they are doing today.",
        examplePrompts: "I've been feeling a bit overwhelmed lately.\nI want to talk about something that's been on my mind.\nHow can I deal with stress at work?"
    },
    ideaGenerator: {
        title: "Idea Generator",
        description: "Unleash your creativity. Provide a topic, and Gemini Pro will brainstorm a list of innovative ideas for you.",
        placeholder: "Enter a topic to brainstorm ideas (e.g., 'sustainable packaging solutions' or 'a plot for a sci-fi novel')...",
        generate: "Generate Ideas",
        error: "An error occurred while generating ideas. Please try again.",
        systemInstruction: "You are a world-class creative idea generator. Your goal is to brainstorm a diverse and innovative list of ideas based on the user's prompt. Format your response as a well-structured markdown list.",
    },
    googleSearch: {
        title: "Google Search",
        placeholder: "Ask anything..."
    },
    googleMigrating: {
        title: "Google Maps",
        placeholder: "e.g., good restaurants nearby..."
    }
  },
  bn: {
    app: {
      title: 'কথাকলি এ।আই',
    },
    sidebar: {
      title: 'এ।আই স্যুট',
      chatbot: 'ভাষামিত্র',
      image_analyzer: 'ছবি বিশ্লেষণ',
      image_generator: 'লিপিলহরী',
      video_analyzer: 'ভিডিও বিশ্লেষণ',
      text_to_speech: 'বাণীবাহক',
      ai_therapist: 'বাক্যবন্ধু',
      idea_generator: 'শব্দসেতু',
    },
    login: {
      welcome: "কথাকলি এ।আই-তে চালিয়ে যেতে সাইন ইন করুন",
      placeholder: "আপনার ইমেল বা ফোন নম্বর লিখুন",
      button: "সাইন ইন / সাইন আপ করুন",
      logout: "লগ আউট",
    },
    chatbot: {
      placeholder: "কিছু জিজ্ঞাসা করুন...",
      send: "পাঠান",
      thinkingMode: "ভাবনা মোড",
      grounding: "গ্রাউন্ডিং",
      sources: "তথ্যসূত্র",
      error: "একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।",
      locationError: "অবস্থান পাওয়া যায়নি। অনুগ্রহ করে অবস্থান পরিষেবা চালু করুন।",
      speechError: "কথোপকথন শনাক্তকরণে ত্রুটি",
      tts: "টিটিএস",
      enableTts: "টেক্সট-টু-স্পিচ সক্ষম করুন",
      disableTts: "টেক্সট-টু-স্পিচ অক্ষম করুন",
      textMode: "হাতে-কথা",
      voiceMode: "কথা-মূখে",
      toggleLanguage: "ভাষা পরিবর্তন করুন",
      stopGenerating: "তৈরি করা বন্ধ করুন",
      shareConversation: "কথোপকথন শেয়ার করুন",
      copyMessage: "বার্তা অনুলিপি করুন",
      copied: "অনুলিপি করা হয়েছে!",
      emptyStateTitle: "কথোপকথন শুরু করুন",
      emptyStateSubtitle: "এই প্রশ্নগুলো জিজ্ঞাসা করে দেখতে পারেন:",
      clearChat: "কথোপকথন মুছুন",
      clearChatConfirmation: "আপনি কি পুরো কথোপকথনটি মুছে ফেলতে নিশ্চিত? এই ক্রিয়াটি ফিরিয়ে আনা যাবে না।",
      exampleQuestions: [
        "বাংলাদেশে ভ্রমণের জন্য কিছু আকর্ষণীয় জায়গা কী কী?",
        "একটি রোবট নিয়ে একটি ছোট কল্পবিজ্ঞান গল্প লিখুন।",
        "আমি কীভাবে আমার প্রতিদিনের কাজের দক্ষতা বাড়াতে পারি?",
        "সহজ ভাষায় কোয়ান্টাম কম্পিউটিং ব্যাখ্যা করুন।",
        "নিরামিষভোজীদের জন্য একটি স্বাস্থ্যকর ৭ দিনের খাবারের তালিকা দিন।"
      ]
    },
    imageAnalyzer: {
        title: "ছবি বিশ্লেষণ",
        description: "তথ্য বিশ্বের দ্বার খুলতে একটি ছবি আপলোড করুন। জেমিনি বস্তু শনাক্ত করতে, পাঠ্য পড়তে এবং বিস্তারিত বিবরণ ও অন্তর্দৃষ্টি প্রদান করতে পারে।",
        selectImage: "ছবি নির্বাচন করুন",
        analyze: "ছবি বিশ্লেষণ করুন",
        analyzing: "বিশ্লেষণ করা হচ্ছে...",
        resultTitle: "বিশ্লেষণের ফলাফল",
        error: "ছবি বিশ্লেষণ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
        placeholder: "এখানে একটি ছবি টেনে আনুন বা নির্বাচন করতে ক্লিক করুন",
        clear: "মুছুন"
    },
    imageGenerator: {
        title: "ছবি তৈরি করুন",
        description: "আপনার কল্পনাকে জীবন্ত করে তুলুন। যেকোনো দৃশ্য বা ধারণার বর্ণনা দিন, এবং দেখুন কিভাবে ইমেজেন-৪ আপনার টেক্সট প্রম্পট থেকে অত্যাশ্চর্য, উচ্চ-মানের ছবি তৈরি করে।",
        placeholder: "যেমন, একটি বিড়াল ছোট মহাকাশচারী হেলমেট পরে তারকাদের দিকে তাকিয়ে আছে...",
        generate: "ছবি তৈরি করুন",
        generating: "তৈরি হচ্ছে...",
        error: "ছবি তৈরি করা যায়নি। আবার চেষ্টা করুন।",
        try_examples: "অথবা একটি উদাহরণ চেষ্টা করুন:",
        examples: "বৃষ্টির দিনে একটি কফি শপের সিনেমার শট।\nএকটি পৌরাণিক বনের প্রাণবন্ত, বিস্তারিত চিত্র।\nএকটি র্যাকুন রুবিক'স কিউব সমাধান করছে, পুরস্কার বিজয়ী ফটোগ্রাফি।"
    },
    videoAnalyzer: {
        title: "ভিডিও বিশ্লেষণ",
        description: "জেমিনি প্রো-কে আপনার ভিডিও দেখতে ও বুঝতে দিন। সারসংক্ষেপ পান, মূল মুহূর্তগুলো শনাক্ত করুন এবং ভিডিও সামগ্রী থেকে অনায়াসে মূল্যবান তথ্য বের করুন।"
    },
    videoGenerator: {
        title: "ভিডিও তৈরি করুন",
        description: "একজন ভিডিও নির্মাতা হয়ে উঠুন। ভিও-এর শক্তি ব্যবহার করে টেক্সট প্রম্পট বা স্থির ছবি থেকে আকর্ষণীয় ভিডিও ক্লিপ তৈরি করুন।",
        placeholder: "যেমন, সূর্যাস্তের সময় একটি ভবিষ্যৎ শহরের এপিক ড্রোন শট, উড়ন্ত গাড়ি...",
        generate: "ভিডিও তৈরি করুন",
        generating: "তৈরি হচ্ছে...",
        error: "ভিডিও তৈরি করা যায়নি। আবার চেষ্টা করুন।",
        try_examples: "অথবা একটি উদাহরণ চেষ্টা করুন:",
        selectKeyTitle: "API কী প্রয়োজন",
        selectKeyDescription: "ভিও দিয়ে ভিডিও তৈরির জন্য একটি Google Cloud API কী প্রয়োজন।",
        selectKeyButton: "API কী নির্বাচন করুন",
        billingInfo: "এই বৈশিষ্ট্যটি ব্যবহার করার জন্য প্রকল্পের বিলিং সক্ষম করতে হবে।",
        learnMore: "আরও জানুন",
        apiKeyError: "অবৈধ API কী। অনুগ্রহ করে একটি বৈধ কী নির্বাচন করুন।",
        loadingMessages: "মেশিন প্রস্তুত করা হচ্ছে...\nক্যামেরার লেন্স পরিষ্কার করা হচ্ছে...\nপিক্সেলকে নাচ শেখানো হচ্ছে...\nএকটি মাস্টারপিস রেন্ডার করা হচ্ছে...\nপ্রায় শেষ, চূড়ান্ত ছোঁয়া যোগ করা হচ্ছে...",
        loadingComplete: "Your video is ready!",
        examples: "একটি রাজকীয় সিংহ ধীর গতিতে তার কেশর ঝাঁকাচ্ছে।\nএকটি ফুল ফোটার টাইম-ল্যাপস, কুঁড়ি থেকে পূর্ণ প্রস্ফুটিত।\nএকটি শিবা ইনু কুকুর পার্টির টুপি পরে শব্দ করছে।"
    },
    textToSpeech: {
        title: "টেক্সট-টু-স্পিচ",
        description: "লিখিত পাঠ্যকে স্বাভাবিক-শব্দযুক্ত, উচ্চ-মানের অডিওতে রূপান্তর করুন। প্রবন্ধ শোনা, ভয়েসওভার তৈরি করা বা অ্যাক্সেসিবিলিটি উন্নত করার জন্য উপযুক্ত।",
        placeholder: "এখানে টেক্সট টাইপ বা পেস্ট করুন...",
        generate: "অডিও তৈরি করুন",
        generating: "তৈরি হচ্ছে...",
        error: "অডিও তৈরি করা যায়নি। আবার চেষ্টা করুন।",
        try_examples: "অথবা একটি উদাহরণ চেষ্টা করুন:",
        examples: "শুভ সকাল! কৃত্রিম বুদ্ধিমত্তার ভবিষ্যতে আপনাকে স্বাগতম।\nকথাকলি একটি উন্নত এ।আই স্যুট।",
        voice: "কণ্ঠ",
        rate: "গতি",
        pitch: "স্বর",
        voices: {
            puck: 'পাক (সাধারণ পুরুষ)',
            charon: 'শ্যারন (গভীর পুরুষ)',
            kore: 'কোর (সাধারণ মহিলা)',
            fenrir: 'ফেনরির (গভীর পুরুষ ২)',
            zephyr: 'জেফির (বন্ধুত্বপূর্ণ পুরুষ)',
        }
    },
    liveConversation: {
        title: "লাইভ কথোপকথন",
        description: "ভবিষ্যতের যোগাযোগের অভিজ্ঞতা নিন। জেমিনি ২.৫ নেティブ অডিওর সাথে একটি সাবলীল, রিয়েল- টাইম ভয়েস কথোপকথন করুন এবং তাত্ক্ষণিকভাবে প্রতিক্রিয়া পান।",
        systemInstruction: "আপনি একজন সহায়ক এ।আই সহকারী। ব্যবহারকারীকে প্রথমে শুভেচ্ছা না জানালে 'নমস্কার'-এর মতো শুভেচ্ছা ব্যবহার করবেন না। সরাসরি বাংলা ভাষায় উত্তর দিন।",
        start: "কথোপকথন শুরু করুন",
        stop: "কথোপকথন বন্ধ করুন",
        listening: "শুনছি...",
        mute: "ভয়েস মিউট করুন",
        unmute: "ভয়েস আনমিউট করুন",
        you: "আপনি",
        ai: "এ।আই",
        status: {
          connecting: "সংযোগ করা হচ্ছে...",
          connected: "সংযুক্ত। কথা বলা শুরু করুন।",
          error: "একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।",
          "not-allowed": "মাইক্রোফোনের অনুমতি দেওয়া হয়নি। অনুগ্রহ করে আপনার ব্রাউজার সেটিংসে মাইক্রোফোনের অনুমতি দিন।",
          "no-speech": "কোনো কথা শনাক্ত করা যায়নি। আবার চেষ্টা করুন।",
          "service-not-allowed": "আপনার ডিভাইস বা ব্রাউজার দ্বারা মাইক্রোফোনের অ্যাক্সেস অস্বীকার করা হয়েছে।",
          disconnected: "সংযোগ বিচ্ছিন্ন। শুরু করতে স্টার্ট ক্লিক করুন।",
        }
    },
    aiTherapist: {
        title: "এ।আই থেরাপিস্ট",
        description: "কথা বলার জন্য একটি নিরাপদ জায়গা। এই এ।আই আপনার সুস্থতাকে সমর্থন করার জন্য একজন যত্নশীল, সহানুভূতিশীল শ্রোতা হিসাবে ডিজাইন করা হয়েছে। এটি পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়।",
        systemInstruction: "আপনি একজন যত্নশীল এবং সহানুভূতিশীল থেরাপিস্ট। আপনার লক্ষ্য হল শোনা, সমর্থন প্রদান করা এবং ব্যবহারকারীকে তাদের অনুভূতি অন্বেষণ করতে সহায়তা করা। আজ তারা কেমন আছে তা আলতো করে জিজ্ঞাসা করে শুরু করুন।",
        examplePrompts: "আমি আজকাল কিছুটা অভিভূত বোধ করছি।\nআমি এমন কিছু নিয়ে কথা বলতে চাই যা আমার মনে ঘুরছে।\nআমি কাজের চাপ কিভাবে সামলাতে পারি?"
    },
    ideaGenerator: {
        title: "আইডিয়া জেনারেটর",
        description: "আপনার সৃজনশীলতা প্রকাশ করুন। একটি বিষয় সরবরাহ করুন, এবং জেমিনি প্রো আপনার জন্য উদ্ভাবনী ধারণার একটি তালিকা তৈরি করবে।",
        placeholder: "আইডিয়া তৈরির জন্য একটি বিষয় লিখুন (যেমন, 'টেকসই প্যাকেজিং সমাধান' বা 'একটি সাই-ফাই উপন্যাসের প্লট')...",
        generate: "আইডিয়া তৈরি করুন",
        error: "আইডিয়া তৈরি করার সময় একটি ত্রুটি ঘটেছে। আবার চেষ্টা করুন।",
        systemInstruction: "আপনি একজন বিশ্বমানের সৃজনশীল আইডিয়া জেনারেটর। আপনার লক্ষ্য হল ব্যবহারকারীর প্রম্পটের উপর ভিত্তি করে বিভিন্ন এবং উদ্ভাবনী ধারণার একটি তালিকা তৈরি করা। আপনার প্রতিক্রিয়াটি একটি সুগঠিত মার্কডাউন তালিকা হিসাবে ফর্ম্যাট করুন।",
    },
    googleSearch: {
        title: "Google সার্চ",
        placeholder: "কিছু জিজ্ঞাসা করুন..."
    },
    googleMaps: {
        title: "Google ম্যাপস",
        placeholder: "যেমন, কাছাকাছি ভালো রেস্তোরাঁ..."
    }
  }
};

export type Language = 'en' | 'bn';