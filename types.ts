
import React from 'react';

// Fix: Moved FeatureId enum here from constants.ts to break circular dependency.
export enum FeatureId {
    Chatbot = 'chatbot',
    ImageGenerator = 'image_generator',
    ImageAnalyzer = 'image_analyzer',
    TextToSpeech = 'text_to_speech',
    AITherapist = 'ai_therapist',
    IdeaGenerator = 'idea_generator',
}

/**
 * Custom interface for CSS properties to include custom CSS variables used in the app.
 * Using this instead of module augmentation to avoid "module 'react' cannot be found" errors
 * that occur in some TypeScript environments when augmenting external modules.
 */
export interface CustomCSSProperties extends React.CSSProperties {
  '--glow-color'?: string;
  '--glow-color-alt'?: string;
}

export interface Feature {
  id: FeatureId;
  icon: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  // Fix: Added groundingChunks to support grounding sources in chat messages.
  groundingChunks?: any[];
}

export interface TranscriptionMessage {
  role: 'user' | 'model';
  text: string;
  isFinal: boolean;
}
