import { useState, useEffect, useRef } from 'react';
import { Digimon } from '../types/digimon';
import { Search, Plus, X, Sun, Moon } from 'lucide-react';

interface MyTeamProps {
  digimonData: Digimon[];
  darkMode: boolean;
  themeColor: string;
  onSelectDigimon: (id: string) => void;
}

const TEAM_STORAGE_KEY = 'digimon-team';
const TEAM_NAME_STORAGE_KEY = 'digimon-team-name';
const MAX_TEAM_SIZE = 6;

export function MyTeam({ digimonData, darkMode, themeColor, onSelectDigimon }: MyTeamProps) {
  const [team, setTeam] = useState<Array<string | null>>(Array(MAX_TEAM_SIZE).fill(null));
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Digimon[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [teamName, setTeamName] = useState('My Team');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Track viewport width to toggle desktop layout
  useEffect(() => {
    const checkViewport = () => setIsDesktop(window.innerWidth >= 1024);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

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

    const savedTeamName = localStorage.getItem(TEAM_NAME_STORAGE_KEY);
    if (savedTeamName) {
      setTeamName(savedTeamName);
    }
  }, []);

  // Save team to localStorage whenever it changes
  useEffect(() => {
    // Save a compact version (without trailing nulls) for cleanliness
    const compact = (team.filter(Boolean) as string[]);
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(compact));
  }, [team]);

  // Save team name to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(TEAM_NAME_STORAGE_KEY, teamName);
  }, [teamName]);

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

  const startEditingName = () => {
    setTempName(teamName);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const saveName = () => {
    const newName = tempName.trim() || 'My Team';
    setTeamName(newName);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
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
    <div className={`${'min-h-screen max-h-screen overflow-y-auto flex justify-center items-start'} ${darkMode ? 'bg-[#272822]' : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300'}`}>
      <div className={`max-w-5xl mx-auto px-4 py-6 w-full ${isDesktop ? '' : 'overflow-x-hidden'}`}>
        <div className={`rounded-xl shadow-lg p-6 md:p-8 ${darkMode ? 'bg-[#3e3d32]' : 'bg-white'}`}>
          {isEditingName ? (
            <div className="flex items-center justify-center mb-6 gap-2">
              <input
                ref={nameInputRef}
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={saveName}
                className={`text-3xl text-center font-medium rounded px-3 py-1 ${
                  darkMode
                    ? 'bg-[#49483e] text-[#f8f8f2] border border-[#75715e] focus:outline-none focus:ring-2 focus:ring-[#a6a49f]'
                    : 'bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>
          ) : (
            <h2 
              onClick={startEditingName}
              className={`text-3xl mb-6 text-center cursor-pointer hover:opacity-70 transition-opacity ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}
              title="Click to rename your team"
            >
              {teamName}
            </h2>
          )}

          {/* Search Bar */}
          <div className={`w-full flex justify-center ${isDesktop ? '' : ''}`} style={{ padding: isDesktop ? '0 40px' : undefined, marginTop: isDesktop ? '24px' : '16px', marginBottom: isDesktop ? '48px' : '36px' }}>
            <div className="relative" style={{ width: isDesktop ? '600px' : '100%', maxWidth: isDesktop ? '600px' : '100%' }}>
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
                    onPointerDown={(e) => {
                      // Consume pointer down so focus stays and event doesn't reach underlying grid
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      // Run add on click (after pointer up) so the dropdown stays mounted during the sequence
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToTeam(d.id);
                    }}
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
                        className="rounded object-contain"
                        style={{ maxWidth: '3rem', maxHeight: '3rem' }}
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
          </div>

          {/* Team Grid */}
          <div className={`w-full flex justify-center ${isDesktop ? '' : 'px-2'}`} style={{ padding: isDesktop ? '0 40px' : undefined }}>
            <div
              style={{
                display: 'grid',
                width: isDesktop ? '600px' : '100%',
                maxWidth: isDesktop ? '600px' : '100%',
                gridTemplateColumns: isDesktop ? 'repeat(3, 200px)' : 'repeat(3, minmax(0, 1fr))',
                gridAutoFlow: 'row',
                gap: isDesktop ? '8px' : '4px',
                paddingBottom: isDesktop ? '40px' : '32px'
              }}
            >
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
                    width: isDesktop ? '200px' : '100%',
                    height: isDesktop ? '200px' : undefined,
                    aspectRatio: isDesktop ? undefined : '1 / 1',
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
                        className="absolute top-0.5 left-0.5 z-30 rounded-full bg-red-600 text-white hover:bg-red-700 shadow ring-2 ring-white/80"
                        style={{ left: '4px', right: 'auto', padding: isDesktop ? '6px' : '4px' }}
                      >
                        <X size={isDesktop ? 18 : 12} />
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
                        className="absolute top-0.5 right-0.5 z-30 rounded font-medium shadow hover:opacity-90"
                        style={{ backgroundColor: themeColor, color: '#ffffff', right: '4px', left: 'auto', padding: isDesktop ? '6px 8px' : '4px 6px', fontSize: isDesktop ? '10px' : '9px' }}
                      >
                        Switch
                      </button>
                      
                      {/* Digimon Image */}
                      <div className="w-full h-full flex flex-col items-center" style={{ padding: isDesktop ? '20px' : '12px' }}>
                        <div className="w-full h-full flex items-center justify-center mb-1" style={{ maxHeight: isDesktop ? '70%' : '60%' }}>
                          <img
                            src={digimon.image}
                            alt={digimon.name}
                            className="object-contain"
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                          />
                        </div>
                        <div className="text-center w-full" style={{ maxHeight: isDesktop ? '30%' : '40%' }}>
                          <div className={`font-medium truncate max-w-full flex items-center justify-center gap-1 ${
                            darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'
                          }`} style={{ fontSize: isDesktop ? '0.875rem' : '11px' }}>
                            {digimon.exclusive && (
                              digimon.exclusive === 'Dawn' ? (
                                <Sun className="text-yellow-400 drop-shadow-md flex-shrink-0" fill="currentColor" style={{ width: '16px', height: '16px' }} />
                              ) : (
                                <Moon className="text-blue-300 drop-shadow-md flex-shrink-0" fill="currentColor" style={{ width: '16px', height: '16px' }} />
                              )
                            )}
                            <span className="truncate">{digimon.name}</span>
                          </div>
                          <div className={`${isDesktop ? 'text-xs' : ''} mt-0.5 ${
                            darkMode ? 'text-[#a6a49f]' : 'text-gray-600'
                          }`} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...(isDesktop ? {} : { fontSize: '9px' }) }}>
                            {digimon.stage}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Empty Slot */
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="flex flex-col items-center justify-center text-center">
                        <Plus 
                          size={48} 
                          className={`${darkMode ? 'text-[#75715e]' : 'text-gray-400'} mx-auto block`}
                        />
                        <div className={`text-xs mt-2 ${
                          darkMode ? 'text-[#a6a49f]' : 'text-gray-500'
                        }`}>
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
