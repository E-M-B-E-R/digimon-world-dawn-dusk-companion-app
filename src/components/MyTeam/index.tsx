import { useState, useRef, useEffect } from 'react';
import { Digimon } from '../../types/digimon';
import { useTeamStorage } from '../../hooks/useTeamStorage';
import { useDigimonSearch } from '../../hooks/useDigimonSearch';
import { TeamHeader } from './TeamHeader';
import { TeamGrid } from './TeamGrid';
import { DigimonSearchBar } from '../shared/DigimonSearchBar';

interface MyTeamProps {
  digimonData: Digimon[];
  darkMode: boolean;
  themeColor: string;
  onSelectDigimon: (id: string) => void;
}

const TEAM_NAME_STORAGE_KEY = 'digimon-team-name';
const MAX_TEAM_SIZE = 6;

export function MyTeam({ digimonData, darkMode, themeColor, onSelectDigimon }: MyTeamProps) {
  const { team, addToTeam, removeFromTeam, isFull } = useTeamStorage();
  const { query, suggestions, showSuggestions, setShowSuggestions, handleSearch, clear } =
    useDigimonSearch(digimonData);

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [teamName, setTeamName] = useState('My Team');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkViewport = () => setIsDesktop(window.innerWidth >= 1024);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(TEAM_NAME_STORAGE_KEY);
    if (saved) setTeamName(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(TEAM_NAME_STORAGE_KEY, teamName);
  }, [teamName]);

  const handleAddToTeam = (digimon: Digimon) => {
    addToTeam(digimon.id, selectedSlot);
    setSelectedSlot(null);
    clear();
  };

  const handleSlotClick = (index: number) => {
    if (team[index]) {
      onSelectDigimon(team[index]!);
    } else {
      setSelectedSlot(index);
      clear();
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSwitch = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSlot(index);
    clear();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const startEditingName = () => {
    setTempName(teamName);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const saveName = () => {
    setTeamName(tempName.trim() || 'My Team');
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveName();
    else if (e.key === 'Escape') setIsEditingName(false);
  };

  const slots = Array.from({ length: MAX_TEAM_SIZE }, (_, i) => ({
    index: i,
    digimon: team[i] ? digimonData.find(d => d.id === team[i]) ?? null : null,
  }));

  return (
    <div
      className={`min-h-screen max-h-screen overflow-y-auto flex justify-center items-start ${
        darkMode
          ? 'bg-[#272822]'
          : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300'
      }`}
    >
      <div className={`max-w-5xl mx-auto px-4 py-6 w-full ${isDesktop ? '' : 'overflow-x-hidden'}`}>
        <div className={`rounded-xl shadow-lg p-6 md:p-8 ${darkMode ? 'bg-[#3e3d32]' : 'bg-white'}`}>
          <TeamHeader
            teamName={teamName}
            isEditing={isEditingName}
            tempName={tempName}
            onTempNameChange={setTempName}
            onStartEdit={startEditingName}
            onSave={saveName}
            onKeyDown={handleNameKeyDown}
            darkMode={darkMode}
            nameInputRef={nameInputRef}
          />

          <div
            className={`w-full flex justify-center`}
            style={{
              padding: isDesktop ? '0 40px' : undefined,
              marginTop: isDesktop ? '24px' : '16px',
              marginBottom: isDesktop ? '48px' : '36px',
            }}
          >
            <div style={{ width: isDesktop ? '600px' : '100%', maxWidth: isDesktop ? '600px' : '100%' }}>
              <DigimonSearchBar
                query={query}
                suggestions={suggestions}
                showSuggestions={showSuggestions}
                onSearch={handleSearch}
                onFocus={() => setShowSuggestions(true)}
                onSelect={handleAddToTeam}
                placeholder={
                  selectedSlot !== null
                    ? `Select Digimon for slot ${selectedSlot + 1}...`
                    : 'Search to add Digimon...'
                }
                disabled={isFull && selectedSlot === null}
                darkMode={darkMode}
                inputRef={inputRef}
                keepFocusOnSelect
              />
            </div>
          </div>

          <TeamGrid
            slots={slots}
            isDesktop={isDesktop}
            darkMode={darkMode}
            themeColor={themeColor}
            selectedSlot={selectedSlot}
            onSlotClick={handleSlotClick}
            onRemove={(index, e) => { e.stopPropagation(); removeFromTeam(index); }}
            onSwitch={handleSwitch}
          />

          {team.length === 0 && (
            <div className={`text-center mt-6 ${darkMode ? 'text-[#a6a49f]' : 'text-gray-600'}`}>
              <p>Your team is empty. Click the + buttons above to add Digimon!</p>
            </div>
          )}
        </div>
      </div>

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
