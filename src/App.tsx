import React, { useState } from 'react';
import { Search, Moon, Sun } from 'lucide-react';
import { digimonData, evolutions } from './data/digimon-data';
import { EvolutionTreeGraph } from './components/EvolutionTreeGraph';
import { DigimonDetails } from './components/DigimonDetails';
import { VerticalEvolutionView } from './components/VerticalEvolutionView';
import { MyTeam } from './components/MyTeam';
import { useIsMobile } from './components/ui/use-mobile';

const LIGHT_MODE_COLOR = '#F8AE5C'; // Orange
const DARK_MODE_COLOR = '#A398D3'; // Light purple

export default function App() {
  // `rootDigimonId` controls which digimon the tree is centered on (prevents redraw on modal open)
  // `modalDigimonId` is used only for showing the details modal
  const [rootDigimonId, setRootDigimonId] = useState<string>('agumon');
  const [modalDigimonId, setModalDigimonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof digimonData>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState(LIGHT_MODE_COLOR);
  const [userChangedColor, setUserChangedColor] = useState(false);
  const [currentView, setCurrentView] = useState<'evolution' | 'team'>('team');
  const isMobile = useIsMobile();

  // Ensure the initial history state contains the current view for back nav
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const state = window.history.state;
    if (!state || !state.view) {
      window.history.replaceState({ view: currentView }, '', `${window.location.pathname}${window.location.search}#${currentView}`);
    }

    const handlePopState = (event: PopStateEvent) => {
      const view = event.state?.view as 'evolution' | 'team' | undefined;
      if (view === 'evolution' || view === 'team') {
        setCurrentView(view);
        // If a root digimon id was stored, restore it so the view matches the history entry
        if (event.state?.rootDigimonId) {
          setRootDigimonId(event.state.rootDigimonId as string);
        }
      } else {
        setCurrentView('team');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const pushViewState = (view: 'evolution' | 'team', extraState: Record<string, unknown> = {}) => {
    if (typeof window === 'undefined') return;
    window.history.pushState(
      { view, ...extraState },
      '',
      `${window.location.pathname}${window.location.search}#${view}`
    );
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Only auto-change color if user hasn't manually changed it
    if (!userChangedColor) {
      setThemeColor(newDarkMode ? DARK_MODE_COLOR : LIGHT_MODE_COLOR);
    }
  };

  const handleColorChange = (color: string) => {
    setThemeColor(color);
    setUserChangedColor(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = digimonData.filter(d => 
        d.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Open details modal without changing the tree root (prevents redraw)
  const handleDigimonClick = (id: string) => {
    const digimon = digimonData.find(d => d.id === id);
    if (digimon) {
      setModalDigimonId(id);
      setShowDetails(true);
    }
  };

  // Selecting from search navigates the tree to the chosen Digimon
  const handleSelectFromSearch = (id: string) => {
    setRootDigimonId(id);
    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle selecting a digimon from team (switch to evolution view)
  const handleTeamDigimonSelect = (id: string) => {
    pushViewState('evolution', { rootDigimonId: id });
    setRootDigimonId(id);
    setCurrentView('evolution');
  };

  const currentRootDigimon = digimonData.find(d => d.id === rootDigimonId);
  const modalDigimon = modalDigimonId ? digimonData.find(d => d.id === modalDigimonId) : null;

  // If mobile, render full-screen vertical view
  if (isMobile) {
    return (
      <>
        {currentView === 'team' ? (
          <div className="flex flex-col min-h-screen">
            <header className="text-white sticky top-0 z-50 shadow-lg flex-shrink-0" style={{ backgroundColor: themeColor }}>
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10"></div>
                  <h1 className="text-2xl">Digimon Evolution</h1>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('evolution')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      currentView === 'evolution'
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Evolution Tree
                  </button>
                  <button
                    onClick={() => setCurrentView('team')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      currentView === 'team'
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    My Team
                  </button>
                </div>
              </div>
            </header>
            <MyTeam
              digimonData={digimonData}
              darkMode={darkMode}
              themeColor={themeColor}
              onSelectDigimon={handleTeamDigimonSelect}
            />
          </div>
        ) : (
          <VerticalEvolutionView
            digimonData={digimonData}
            evolutions={evolutions}
            onDigimonClick={handleDigimonClick}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            headerColor={themeColor}
            setHeaderColor={setThemeColor}
            lineColor={themeColor}
            setLineColor={setThemeColor}
            currentView={currentView}
            setCurrentView={setCurrentView}
            initialRootDigimonId={rootDigimonId}
          />
        )}
        
        {/* Details Modal */}
        {showDetails && modalDigimon && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <DigimonDetails 
                digimon={modalDigimon} 
                onClose={() => { setShowDetails(false); setModalDigimonId(null); }}
                onDigimonClick={(newDigimon) => {
                  setModalDigimonId(newDigimon.id);
                }}
                darkMode={darkMode}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#272822]' : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300'}`}>
      {/* Header */}
      <header className="shadow-md sticky top-0 z-40" style={{ backgroundColor: themeColor }}>
        <div className="max-w-[95%] mx-auto px-4 py-4">
          <div className="flex flex-col items-center gap-4">
            {/* Title and Controls */}
            <div className="w-full flex items-center justify-between">
              <div className="flex-1" />
              
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl text-white">
                  Digimon Evolution Tree
                </h1>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Digimon World: Dusk & Dawn
                </p>
              </div>
              
              {/* Color Picker and Dark Mode */}
              <div className="flex-1 flex items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-300">Theme:</label>
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-2 border-white"
                  />
                </div>
                <button
                  onClick={handleDarkModeToggle}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                </button>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex gap-3 mb-2">
              <button
                onClick={() => setCurrentView('evolution')}
                className={`py-2 px-6 rounded-lg transition-all ${
                  currentView === 'evolution'
                    ? 'bg-white/20 text-white font-medium shadow-lg'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Evolution Tree
              </button>
              <button
                onClick={() => setCurrentView('team')}
                className={`py-2 px-6 rounded-lg transition-all ${
                  currentView === 'team'
                    ? 'bg-white/20 text-white font-medium shadow-lg'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                My Team
              </button>
            </div>
            
            {/* Search Bar - Centered - Only show in evolution view */}
            {currentView === 'evolution' && (
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Digimon..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-[#3e3d32] text-[#f8f8f2] placeholder-gray-500 border border-[#75715e]' 
                    : 'bg-white border border-gray-300'
                }`}
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl border max-h-96 overflow-y-auto z-50 ${
                  darkMode ? 'bg-[#3e3d32] border-[#75715e]' : 'bg-white border-gray-200'
                }`}>
                  {suggestions.map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleSelectFromSearch(d.id)}
                      className={`w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 ${
                        darkMode 
                          ? 'hover:bg-[#49483e] border-[#75715e]' 
                          : 'hover:bg-gray-100 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={d.image} 
                          alt={d.name}
                          className="rounded object-contain"
                          style={{ maxWidth: '3rem', maxHeight: '3rem' }}
                        />
                        <div>
                          <div className={darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}>{d.name}</div>
                          <div className={darkMode ? 'text-xs text-[#a6a49f]' : 'text-xs text-gray-600'}>
                            {d.stage} • {d.type.join(', ')}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[95%] mx-auto p-4 md:p-6">
        {currentView === 'team' ? (
          <MyTeam
            digimonData={digimonData}
            darkMode={darkMode}
            themeColor={themeColor}
            onSelectDigimon={handleTeamDigimonSelect}
          />
        ) : (
          <div className={`rounded-xl shadow-lg p-4 md:p-6 ${darkMode ? 'bg-[#3e3d32]' : 'bg-white'}`}>
            <EvolutionTreeGraph
              rootDigimonId={rootDigimonId}
              digimonData={digimonData}
              evolutions={evolutions}
              onDigimonClick={handleDigimonClick}
              darkMode={darkMode}
              lineColor={themeColor}
              digimonName={currentRootDigimon?.name}
              isMobile={isMobile}
            />
          </div>
        )}
      </main>

      {/* Details Modal */}
      {showDetails && modalDigimon && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DigimonDetails 
              digimon={modalDigimon} 
              onClose={() => { setShowDetails(false); setModalDigimonId(null); }}
              onDigimonClick={(newDigimon) => {
                setModalDigimonId(newDigimon.id);
              }}
              darkMode={darkMode}
            />
          </div>
        </div>
      )}

      {/* Click overlay to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}