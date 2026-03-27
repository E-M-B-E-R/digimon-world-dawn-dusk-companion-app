import { useState, useEffect, useRef } from 'react';
import { Digimon, Evolution, DigimonStage } from '../../types/digimon';
import { Search, Moon, Sun } from 'lucide-react';
import { useVerticalEvolutionTree } from '../../hooks/useVerticalEvolutionTree';
import { useDigimonSearch } from '../../hooks/useDigimonSearch';
import { isArmorDigimon } from '../../constants/armorDigimon';
import { DigimonSearchBar } from '../shared/DigimonSearchBar';

interface VerticalEvolutionViewProps {
  digimonData: Digimon[];
  evolutions: Evolution[];
  onDigimonClick: (id: string) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  headerColor: string;
  setHeaderColor: (value: string) => void;
  lineColor: string;
  setLineColor: (value: string) => void;
  currentView?: 'evolution' | 'team';
  setCurrentView?: (view: 'evolution' | 'team') => void;
  initialRootDigimonId?: string;
}

const stageOrder: DigimonStage[] = ['In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega'];

const ARMOR_COLOR = '#facc15';

interface DigimonPosition {
  id: string;
  x: number;
  y: number;
  stage: DigimonStage;
}

export function VerticalEvolutionView({
  digimonData,
  evolutions,
  onDigimonClick,
  darkMode,
  setDarkMode,
  headerColor,
  setHeaderColor,
  lineColor,
  setLineColor,
  currentView,
  setCurrentView,
  initialRootDigimonId,
}: VerticalEvolutionViewProps) {
  const [positions, setPositions] = useState<DigimonPosition[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const inTrainingFirst = digimonData.find(d => d.stage === 'In-Training')?.id ?? digimonData[0]?.id ?? '';
  const [rootDigimonId, setRootDigimonId] = useState(initialRootDigimonId || inTrainingFirst);

  useEffect(() => {
    if (initialRootDigimonId && initialRootDigimonId !== rootDigimonId) {
      setRootDigimonId(initialRootDigimonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRootDigimonId]);

  const { treeDigimon, digimonByStage, treeEvolutions } = useVerticalEvolutionTree(
    rootDigimonId,
    evolutions,
    digimonData
  );

  const { query, suggestions, showSuggestions, setShowSuggestions, handleSearch, clear } =
    useDigimonSearch(digimonData);

  const handleSelectFromSearch = (digimon: Digimon) => {
    setRootDigimonId(digimon.id);
    clear();
  };

  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;
      const newPositions: DigimonPosition[] = [];
      const cards = containerRef.current.querySelectorAll('[data-digimon-id]');

      cards.forEach(card => {
        const id = card.getAttribute('data-digimon-id');
        const digimon = treeDigimon.find(d => d.id === id);
        if (id && digimon) {
          const rect = card.getBoundingClientRect();
          const containerRect = containerRef.current!.getBoundingClientRect();
          newPositions.push({
            id,
            x: rect.left - containerRect.left + containerRef.current!.scrollLeft + rect.width / 2,
            y: rect.top - containerRect.top + containerRef.current!.scrollTop + rect.height / 2,
            stage: digimon.stage,
          });
        }
      });

      setPositions(newPositions);
    };

    const timer = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);
    const container = containerRef.current;
    if (container) container.addEventListener('scroll', updatePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
      if (container) container.removeEventListener('scroll', updatePositions);
    };
  }, [rootDigimonId, treeDigimon]);

  const getAngularConnections = () => {
    const fromCounts: Record<string, number> = {};
    const toCounts: Record<string, number> = {};
    const fromIndices: Record<string, number> = {};
    const toIndices: Record<string, number> = {};

    treeEvolutions.forEach(evo => {
      fromCounts[evo.from] = (fromCounts[evo.from] || 0) + 1;
      toCounts[evo.to] = (toCounts[evo.to] || 0) + 1;
      fromIndices[evo.from] = 0;
      toIndices[evo.to] = 0;
    });

    return treeEvolutions
      .map(evo => {
        const fromPos = positions.find(p => p.id === evo.from);
        const toPos = positions.find(p => p.id === evo.to);
        if (!fromPos || !toPos) return null;

        const cardWidth = 80;
        const cardHeight = 80;
        const borderWidth = 3;
        const fromCount = fromCounts[evo.from];
        const fromIndex = fromIndices[evo.from]++;
        const toCount = toCounts[evo.to];
        const toIndex = toIndices[evo.to]++;

        const getOffset = (index: number, total: number) => {
          if (total === 1) return 0;
          const spacing = cardWidth * 0.6;
          const step = spacing / (total - 1);
          return index * step - spacing / 2;
        };

        const fromX = fromPos.x + getOffset(fromIndex, fromCount);
        const toX = toPos.x + getOffset(toIndex, toCount);
        const fromY = fromPos.y + cardHeight / 2 + borderWidth;
        const toY = toPos.y - cardHeight / 2 - borderWidth;
        const midY = (fromY + toY) / 2;

        return {
          from: fromPos,
          to: toPos,
          path: `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`,
        };
      })
      .filter(conn => conn !== null);
  };

  const currentRootDigimon = digimonData.find(d => d.id === rootDigimonId);

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode
          ? 'bg-[#272822]'
          : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300'
      }`}
    >
      <header
        className="text-white sticky top-0 z-50 shadow-lg flex-shrink-0"
        style={{ backgroundColor: headerColor }}
      >
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10" />
            <h1 className="text-2xl">Digimon Evolution</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {setCurrentView && (
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
          )}

          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white opacity-90">Theme:</label>
              <input
                type="color"
                value={headerColor}
                onChange={e => {
                  setHeaderColor(e.target.value);
                  setLineColor(e.target.value);
                }}
                className="w-8 h-8 rounded cursor-pointer border-2 border-white"
              />
            </div>
          </div>

          <div className="relative max-w-md mx-auto">
            <DigimonSearchBar
              query={query}
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              onSearch={handleSearch}
              onFocus={() => setShowSuggestions(true)}
              onSelect={handleSelectFromSearch}
              placeholder="Search Digimon..."
              darkMode={darkMode}
              showType
            />
          </div>
        </div>
      </header>

      {currentRootDigimon && (
        <div className="px-4 py-4 flex-shrink-0">
          <h2 className={`text-2xl text-center ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>
            {currentRootDigimon.name}
          </h2>
        </div>
      )}

      <div className="relative flex-1 overflow-y-auto overflow-x-hidden" ref={containerRef}>
        <div className="relative z-0 px-4 py-6 space-y-8">
          {stageOrder.map(stage => {
            const digimons = digimonByStage[stage];
            if (!digimons || digimons.length === 0) return null;

            return (
              <div key={stage} className="flex justify-center">
                <div
                  className={`w-full max-w-full rounded-2xl p-6 ${
                    darkMode ? 'bg-[#3e3d32]/60' : 'bg-white/40'
                  }`}
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <div className="flex flex-wrap gap-3 justify-center">
                    {digimons.map(digimon => {
                      const isArmor = isArmorDigimon(digimon.id);
                      const borderColor = isArmor ? ARMOR_COLOR : lineColor;

                      return (
                        <button
                          key={digimon.id}
                          data-digimon-id={digimon.id}
                          onClick={() => onDigimonClick(digimon.id)}
                          className="relative group z-20 flex flex-col items-center"
                          style={{ width: '80px' }}
                        >
                          <div
                            className={`w-full rounded-lg overflow-hidden transition-transform group-hover:scale-110 shadow-md flex items-center justify-center relative ${
                              darkMode ? 'bg-[#49483e]' : 'bg-gray-50'
                            }`}
                            style={{ border: `3px solid ${borderColor}`, width: '80px', height: '80px' }}
                          >
                            <img
                              src={digimon.image}
                              alt={digimon.name}
                              className="mx-auto block"
                              style={{ maxWidth: '100%', maxHeight: '100%' }}
                            />
                          </div>
                          <div
                            className={`mt-1 flex items-center justify-center gap-1 w-full ${
                              darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'
                            }`}
                            style={{ fontSize: '14px' }}
                          >
                            {digimon.exclusive && (
                              digimon.exclusive === 'Dawn' ? (
                                <Sun className="text-yellow-400 drop-shadow-md flex-shrink-0" fill="currentColor" style={{ width: '16px', height: '16px' }} />
                              ) : (
                                <Moon className="text-blue-300 drop-shadow-md flex-shrink-0" fill="currentColor" style={{ width: '16px', height: '16px' }} />
                              )
                            )}
                            <span className="truncate">{digimon.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showSuggestions && (
        <div className="fixed inset-0 z-30" onClick={() => setShowSuggestions(false)} />
      )}
    </div>
  );
}
