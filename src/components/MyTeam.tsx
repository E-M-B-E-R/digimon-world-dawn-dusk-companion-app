import { useState, useEffect, useRef } from 'react';
import { Digimon } from '../types/digimon';
import { Search, Plus, X } from 'lucide-react';

interface MyTeamProps {
  digimonData: Digimon[];
  darkMode: boolean;
  themeColor: string;
  onSelectDigimon: (id: string) => void;
}

const TEAM_STORAGE_KEY = 'digimon-team';
const MAX_TEAM_SIZE = 6;

export function MyTeam({ digimonData, darkMode, themeColor, onSelectDigimon }: MyTeamProps) {
  const [team, setTeam] = useState<Array<string | null>>(Array(MAX_TEAM_SIZE).fill(null));
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Digimon[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load team from localStorage on mount
  useEffect(() => {
    const savedTeam = localStorage.getItem(TEAM_STORAGE_KEY);
    if (savedTeam) {
      try {
        const parsed = JSON.parse(savedTeam);
        if (Array.isArray(parsed)) {
          // Compact any gaps on load, then pad to fixed length
          const compact = (parsed as Array<string | null | undefined>).filter(Boolean) as string[];
          const normalized: Array<string | null> = [
            ...compact,
            ...Array(Math.max(0, MAX_TEAM_SIZE - compact.length)).fill(null)
          ];
          setTeam(normalized.slice(0, MAX_TEAM_SIZE));
        }
      } catch (e) {
        console.error('Failed to load team:', e);
      }
    }
  }, []);

  // Save team to localStorage whenever it changes
  useEffect(() => {
    // Save a compact version (without trailing nulls) for cleanliness
    const compact = (team.filter(Boolean) as string[]);
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(compact));
  }, [team]);

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

  const handleAddToTeam = (digimonId: string) => {
    let nextTeam = [...team];

    if (selectedSlot !== null) {
      nextTeam[selectedSlot] = digimonId;
    } else {
      const emptyIndex = nextTeam.findIndex(id => id == null);
      if (emptyIndex !== -1) {
        nextTeam[emptyIndex] = digimonId;
      } else if (nextTeam.filter(Boolean).length < MAX_TEAM_SIZE) {
        nextTeam = [...nextTeam, digimonId];
      } else {
        return;
      }
    }

    // Always compact after any add so there are no gaps
    const compact = (nextTeam.filter(Boolean) as string[]);
    const filled: Array<string | null> = [
      ...compact,
      ...Array(Math.max(0, MAX_TEAM_SIZE - compact.length)).fill(null)
    ];
    setTeam(filled);

    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSlot(null);
  };

  const handleRemoveFromTeam = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTeam = [...team];
    newTeam[index] = null;
    // Shift up: compact non-nulls to the front, pad with nulls
    const compact = newTeam.filter(Boolean) as string[];
    const filled: Array<string | null> = [...compact, ...Array(MAX_TEAM_SIZE - compact.length).fill(null)];
    setTeam(filled);
  };

  const handleSlotClick = (index: number) => {
    if (team[index]) {
      // If slot has a digimon, navigate to its evolution tree
      onSelectDigimon(team[index]);
    } else {
      // If slot is empty, open search
      setSelectedSlot(index);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
      // Focus the search input for quicker entry
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const getDigimonById = (id: string) => digimonData.find(d => d.id === id);

  // Create array of 6 slots
  const slots = Array.from({ length: MAX_TEAM_SIZE }, (_, i) => ({
    index: i,
    digimonId: team[i] || null
  }));

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#272822]' : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300'}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className={`rounded-xl shadow-lg p-6 md:p-8 ${darkMode ? 'bg-[#3e3d32]' : 'bg-white'}`}>
          <h2 className={`text-3xl mb-6 text-center ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>
            My Team
          </h2>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={selectedSlot !== null ? `Select Digimon for slot ${selectedSlot + 1}...` : "Search to add Digimon..."}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              disabled={(team.filter(Boolean).length >= MAX_TEAM_SIZE) && selectedSlot === null}
              ref={inputRef}
              className={`w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                darkMode 
                  ? 'bg-[#49483e] text-[#f8f8f2] placeholder-gray-500 border border-[#75715e] focus:ring-[#a6a49f]' 
                  : 'bg-gray-50 border border-gray-300 focus:ring-blue-500'
              } ${team.length >= MAX_TEAM_SIZE && selectedSlot === null ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl border max-h-96 overflow-y-auto z-50 ${
                darkMode ? 'bg-[#49483e] border-[#75715e]' : 'bg-white border-gray-200'
              }`}
                onMouseDown={(e) => {
                  // Keep input focused while interacting with the dropdown
                  e.preventDefault();
                }}
              >
                {suggestions.map(d => (
                  <button
                    key={d.id}
                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToTeam(d.id); }}
                    className={`w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 ${
                      darkMode 
                        ? 'hover:bg-[#3e3d32] border-[#75715e]' 
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
                          {d.stage}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Team Grid */}
          <div className="w-full flex justify-center">
            <div className="gap-0" style={{ display: 'grid', width: '600px', gridTemplateColumns: 'repeat(3, 200px)', gridAutoFlow: 'row' }}>
            {slots.map(slot => {
              const digimon = slot.digimonId ? getDigimonById(slot.digimonId) : null;
              
              return (
                <div
                  key={slot.index}
                  onClick={() => handleSlotClick(slot.index)}
                  className={`relative group rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:z-20 ${
                    darkMode ? 'bg-[#49483e]' : 'bg-gray-50'
                  } ${selectedSlot === slot.index ? 'ring-4' : ''}`}
                  style={{
                    width: '200px',
                    height: '200px',
                    borderWidth: '3px',
                    borderStyle: 'solid',
                    borderColor: digimon ? themeColor : darkMode ? '#75715e' : '#d1d5db',
                    ...(selectedSlot === slot.index && { '--tw-ring-color': themeColor } as React.CSSProperties)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSlotClick(slot.index);
                    }
                  }}
                >
                  {digimon ? (
                    <>
                      {/* Remove button (moved to top-left) */}
                      <button
                        onClick={(e) => handleRemoveFromTeam(slot.index, e)}
                        className="absolute top-0.5 left-0.5 z-30 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow ring-2 ring-white/80"
                        style={{ left: '4px', right: 'auto' }}
                      >
                        <X size={18} />
                      </button>

                      {/* Switch button (moved to top-right) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlot(slot.index);
                          setSearchQuery('');
                          setSuggestions([]);
                          setShowSuggestions(false);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        className="absolute top-0.5 right-0.5 z-30 px-2 py-1 rounded text-[10px] font-medium shadow hover:opacity-90"
                        style={{ backgroundColor: themeColor, color: '#ffffff', right: '4px', left: 'auto' }}
                      >
                        Switch
                      </button>
                      
                      {/* Digimon Image */}
                      <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                        <div className="flex-1 flex items-center justify-center w-full mb-2">
                          <img
                            src={digimon.image}
                            alt={digimon.name}
                            className="mx-auto block"
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                          />
                        </div>
                        <div className="text-center">
                          <div className={`font-medium text-sm md:text-base truncate max-w-full ${
                            darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'
                          }`}>
                            {digimon.name}
                          </div>
                          <div className={`text-xs mt-1 ${
                            darkMode ? 'text-[#a6a49f]' : 'text-gray-600'
                          }`}>
                            {digimon.stage}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Empty Slot */
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Plus 
                          size={48} 
                          className={darkMode ? 'text-[#75715e]' : 'text-gray-400'}
                        />
                        <div className={`text-xs mt-2 ${
                          darkMode ? 'text-[#a6a49f]' : 'text-gray-500'
                        }`}>
                          Add Digimon
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>

          {/* Empty State Message */}
          {team.length === 0 && (
            <div className={`text-center mt-6 ${darkMode ? 'text-[#a6a49f]' : 'text-gray-600'}`}>
              <p>Your team is empty. Click the + buttons above to add Digimon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Click overlay to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowSuggestions(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}
