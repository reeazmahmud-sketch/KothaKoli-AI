import type { Feature } from './types';
import { FeatureId } from './types';

export const FEATURES_LEFT: Feature[] = [
    { id: FeatureId.Chatbot, icon: 'voice_chat' },
    { id: FeatureId.IdeaGenerator, icon: 'lightbulb' },
    { id: FeatureId.AITherapist, icon: 'health_and_safety' },
];

export const FEATURES_RIGHT: Feature[] = [
    { id: FeatureId.ImageGenerator, icon: 'image' },
    { id: FeatureId.ImageAnalyzer, icon: 'document_scanner' },
    { id: FeatureId.TextToSpeech, icon: 'microphone' },
];

export const ALL_FEATURES = [...FEATURES_LEFT, ...FEATURES_RIGHT];