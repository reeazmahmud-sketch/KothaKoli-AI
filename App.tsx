import React, { useState, useEffect } from 'react';
import { FEATURES_LEFT, FEATURES_RIGHT } from './constants';
import { FeatureId } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LanguageProvider } from './contexts/LanguageContext';
import { Login } from './features/Login';
import { GoogleSearchPage } from './features/GoogleSearchPage';
import { GoogleMapsPage } from './features/GoogleMapsPage';

import { Chatbot } from './features/Chatbot';
import { ImageGenerator } from './features/ImageGenerator';
import { ImageAnalyzer } from './features/ImageAnalyzer';
import { TextToSpeech } from './features/TextToSpeech';
import { AITherapist } from './features/AITherapist';
import { IdeaGenerator } from './features/IdeaGenerator';

type Overlay = 'none' | 'search' | 'maps';

const featureComponentMap: Record<FeatureId, React.FC<any>> = {
    [FeatureId.Chatbot]: Chatbot,
    [FeatureId.ImageGenerator]: ImageGenerator,
    [FeatureId.ImageAnalyzer]: ImageAnalyzer,
    [FeatureId.TextToSpeech]: TextToSpeech,
    [FeatureId.AITherapist]: AITherapist,
    [FeatureId.IdeaGenerator]: IdeaGenerator,
};

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureId>(FEATURES_LEFT[0].id);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeOverlay, setActiveOverlay] = useState<Overlay>('none');

  useEffect(() => {
    // Check for saved session on initial load
    const storedAuth = localStorage.getItem('kathakoli_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('kathakoli_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('kathakoli_auth');
    setIsAuthenticated(false);
  };
  
  const ActiveComponent = featureComponentMap[activeFeature];

  if (!isAuthenticated) {
    return (
        <LanguageProvider>
            <Login onLogin={handleLogin} />
        </LanguageProvider>
    );
  }

  const openOverlay = (overlay: Overlay) => setActiveOverlay(overlay);
  const closeOverlay = () => setActiveOverlay('none');

  return (
    <LanguageProvider>
      <div className="h-screen w-screen bg-[var(--bg-dark)] text-[var(--text-light)] font-sans relative flex flex-col">
        <Header onLogout={handleLogout} />
        <div className="flex-1 overflow-hidden pt-20">
            <Sidebar 
              activeFeature={activeFeature} 
              setActiveFeature={setActiveFeature}
              features={FEATURES_LEFT}
              position="left"
            />
            
            <main className="h-full overflow-y-hidden mx-[28px]">
              <div className="p-4 sm:p-6 lg:p-8 h-full">
                {ActiveComponent ? <ActiveComponent openOverlay={openOverlay} /> : <div>Select a feature</div>}
              </div>
            </main>
            
            <Sidebar 
              activeFeature={activeFeature} 
              setActiveFeature={setActiveFeature}
              features={FEATURES_RIGHT}
              position="right"
            />
        </div>

        {activeOverlay === 'search' && <GoogleSearchPage onClose={closeOverlay} />}
        {activeOverlay === 'maps' && <GoogleMapsPage onClose={closeOverlay} />}
      </div>
    </LanguageProvider>
  );
};

export default App;