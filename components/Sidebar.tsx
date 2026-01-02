
import React from 'react';
import type { Feature } from '../types';
import { FeatureId } from '../types';
import { Icon } from './Icon';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activeFeature: FeatureId;
  setActiveFeature: (feature: FeatureId) => void;
  features: Feature[];
  position: 'left' | 'right';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeFeature, setActiveFeature, features, position }) => {
  // We need getTranslation to specifically get Bengali names for the hover tooltips.
  const { getTranslation } = useLanguage();
  const isLeft = position === 'left';

  const sidebarClasses = `
    fixed top-20 h-[calc(100vh-5rem)] z-40 w-28 
    transition-transform duration-300 ease-in-out
    ${isLeft ? 'left-0 -translate-x-[84px] hover:translate-x-0' : 'right-0 translate-x-[84px] hover:translate-x-0'}
  `;

  return (
    <div className={sidebarClasses}>
        <nav className={`w-full bg-[var(--bg-medium)]/80 backdrop-blur-md border-[var(--border-color)] ${isLeft ? 'border-r' : 'border-l'} flex flex-col p-2 h-full`}>
            <div className="h-16 mb-2 flex-shrink-0"></div>
            <ul className="space-y-3 flex-1 w-full overflow-y-auto">
                {features.map((feature) => (
                <li key={feature.id}>
                    <button
                        onClick={() => setActiveFeature(feature.id)}
                        // The title attribute will show the Bengali name on hover, which is good for accessibility
                        title={getTranslation('bn', `sidebar.${feature.id}`)}
                        className={`
                            w-full h-24
                            rounded-xl transition-all duration-200 relative group
                            bg-gradient-to-br from-gray-800/50 to-gray-900/50
                            border-t border-white/10
                            shadow-[0_8px_15px_rgba(0,0,0,0.4),inset_0_2px_2px_rgba(255,255,255,0.1),inset_0_-2px_2px_rgba(0,0,0,0.3)]
                            active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] active:translate-y-px
                            hover:-translate-y-px hover:shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_2px_2px_rgba(255,255,255,0.15),inset_0_-2px_2px_rgba(0,0,0,0.4)]
                            ${ activeFeature === feature.id ? 'text-white' : 'text-gray-400 hover:text-white' }
                        `}
                    >
                        {activeFeature === feature.id && (
                            <>
                                <div className={`absolute top-0 h-full w-1 ${isLeft ? 'left-0' : 'right-0'}`} style={{background: 'var(--accent-gradient)'}}></div>
                                {/* A more vibrant, dynamic glow effect for the active button */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-xl animate-vibrant-glow"></div>
                            </>
                        )}
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                            {/* Icon visible by default, hidden on hover */}
                            <Icon name={feature.icon} className="h-9 w-9 transition-all duration-300 group-hover:opacity-0 group-hover:scale-75" />

                            {/* Bengali text hidden by default, visible on hover */}
                            <span className="
                                absolute inset-0 flex items-center justify-center text-center
                                text-sm font-bold font-orbitron 
                                opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 
                                transition-all duration-300
                                p-2 leading-tight
                            ">
                                {getTranslation('bn', `sidebar.${feature.id}`)}
                            </span>
                        </div>
                    </button>
                </li>
                ))}
            </ul>
        </nav>
        {/* Hide scrollbar for the sidebar list */}
        <style>{`
            nav ul { scrollbar-width: none; }
            nav ul::-webkit-scrollbar { display: none; }
        `}</style>
    </div>
  );
};