import { useState } from 'react';
import { Search, Moon, Sun } from 'lucide-react';
import { digimonData, evolutions } from './data/digimon-data';
import { EvolutionTreeGraph } from './components/EvolutionTreeGraph';
import { DigimonDetails } from './components/DigimonDetails';
import { VerticalEvolutionView } from './components/VerticalEvolutionView';
import { useIsMobile } from './components/ui/use-mobile';

const LIGHT_MODE_COLOR = '#F8AE5C'; // Orange
const DARK_MODE_COLOR = '#A398D3'; // Light purple

export default function App() {
  const [selectedDigimon, setSelectedDigimon] = useState<string>('agumon');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof digimonData>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState(LIGHT_MODE_COLOR);
  const [userChangedColor, setUserChangedColor] = useState(false);
  const isMobile = useIsMobile();

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

  const handleDigimonClick = (id: string) => {
    const digimon = digimonData.find(d => d.id === id);
    if (digimon) {
      setShowDetails(true);
      setSelectedDigimon(id);
    }
  };

  const handleSelectFromSearch = (id: string) => {
    setSelectedDigimon(id);
    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const currentDigimon = digimonData.find(d => d.id === selectedDigimon);

  // If mobile, render full-screen vertical view
  if (isMobile) {
    return (
      <>
        <VerticalEvolutionView
          digimonData={digimonData}
          evolutions={evolutions}
          onDigimonClick={handleDigimonClick}
          onBackToTree={() => {}} // No back button on mobile
          showBackButton={false}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          headerColor={themeColor}
          setHeaderColor={setThemeColor}
          lineColor={themeColor}
          setLineColor={setThemeColor}
        />
        
        {/* Details Modal */}
        {showDetails && currentDigimon && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <DigimonDetails 
                digimon={currentDigimon} 
                onClose={() => setShowDetails(false)}
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
            
            {/* Search Bar - Centered */}
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
                          className="w-12 h-12 rounded object-cover"
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[95%] mx-auto p-4 md:p-6">
        <div className={`rounded-xl shadow-lg p-4 md:p-6 ${darkMode ? 'bg-[#3e3d32]' : 'bg-white'}`}>
          <EvolutionTreeGraph
            rootDigimonId={selectedDigimon}
            digimonData={digimonData}
            evolutions={evolutions}
            onDigimonClick={handleDigimonClick}
            darkMode={darkMode}
            lineColor={themeColor}
            digimonName={currentDigimon?.name}
          />
        </div>
      </main>

      {/* Details Modal */}
      {showDetails && currentDigimon && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DigimonDetails 
              digimon={currentDigimon} 
              onClose={() => setShowDetails(false)}
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