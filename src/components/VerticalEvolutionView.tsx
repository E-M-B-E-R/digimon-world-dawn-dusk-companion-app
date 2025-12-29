import { useState, useEffect, useRef, useMemo } from 'react';
import { Digimon, Evolution, DigimonStage } from '../types/digimon';
import { Search, Moon, Sun } from 'lucide-react';

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

interface DigimonPosition {
  id: string;
  x: number;
  y: number;
  stage: DigimonStage;
}

const ARMOR_COLOR = '#facc15';
const ARMOR_IDS = new Set([
  'flamedramon',
  'magnamon',
  'kenkimon',
  'seahomon',
  'toucanmon',
  'allomon',
  'shurimon',
  'pipismon',
  'ponchomon',
  'prairiemon',
  'aurumon',
  'shadramon',
  'kongoumon',
  'tylomon',
  'kabukimon',
  'lanksmon'
]);

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
  initialRootDigimonId
}: VerticalEvolutionViewProps) {
  const [positions, setPositions] = useState<DigimonPosition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Digimon[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the first In-Training Digimon as default root
  const inTrainingDigimon = useMemo(() => 
    digimonData.filter(d => d.stage === 'In-Training'),
    [digimonData]
  );
  
  const [rootDigimonId, setRootDigimonId] = useState(
    initialRootDigimonId || inTrainingDigimon[0]?.id || digimonData[0]?.id || ''
  );

  // Keep internal root in sync when parent provides a new selection
  useEffect(() => {
    if (initialRootDigimonId && initialRootDigimonId !== rootDigimonId) {
      setRootDigimonId(initialRootDigimonId);
    }
    // We intentionally exclude rootDigimonId from deps to avoid loops when searching locally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRootDigimonId]);

  // Build evolution tree from root (both ancestors and descendants) - memoized
  const treeDigimonIds = useMemo(() => {
    const tree: Set<string> = new Set([rootDigimonId]);
    
    // Add all descendants (forward evolutions)
    const forwardQueue = [rootDigimonId];
    while (forwardQueue.length > 0) {
      const current = forwardQueue.shift()!;
      const nextEvolutions = evolutions.filter(e => e.from === current);
      
      nextEvolutions.forEach(evo => {
        if (!tree.has(evo.to)) {
          tree.add(evo.to);
          forwardQueue.push(evo.to);
        }
      });
    }
    
    // Add all ancestors (reverse evolutions) and their siblings
    const ancestorQueue = [rootDigimonId];
    while (ancestorQueue.length > 0) {
      const current = ancestorQueue.shift()!;
      const prevEvolutions = evolutions.filter(e => e.to === current);
      
      prevEvolutions.forEach(evo => {
        if (!tree.has(evo.from)) {
          tree.add(evo.from);
          ancestorQueue.push(evo.from);
          
          // Also add all siblings of current (other evolutions from the same parent)
          const siblingsQueue = [evo.from];
          while (siblingsQueue.length > 0) {
            const parent = siblingsQueue.shift()!;
            const siblings = evolutions.filter(e => e.from === parent);
            
            siblings.forEach(siblingEvo => {
              if (!tree.has(siblingEvo.to)) {
                tree.add(siblingEvo.to);
                siblingsQueue.push(siblingEvo.to); // Continue adding descendants of siblings
              }
            });
          }
        }
      });
    }
    
    return Array.from(tree);
  }, [rootDigimonId, evolutions]);

  const treeDigimon = useMemo(() => 
    digimonData.filter(d => treeDigimonIds.includes(d.id)),
    [digimonData, treeDigimonIds]
  );

  // Group Digimon by stage (only those in the tree) - memoized
  const digimonByStage = useMemo(() => 
    stageOrder.reduce((acc, stage) => {
      acc[stage] = treeDigimon.filter(d => d.stage === stage);
      return acc;
    }, {} as Record<DigimonStage, Digimon[]>),
    [treeDigimon]
  );

  // Get only evolutions within the tree - memoized
  const treeEvolutions = useMemo(() => 
    evolutions.filter(e => 
      treeDigimonIds.includes(e.from) && treeDigimonIds.includes(e.to)
    ),
    [evolutions, treeDigimonIds]
  );

  // Handle search
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

  const handleSelectFromSearch = (id: string) => {
    setRootDigimonId(id);
    setSearchQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Calculate positions after render - removed scroll listener to fix scrolling bug
  useEffect(() => {
    const updatePositions = () => {
      if (containerRef.current) {
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
              stage: digimon.stage
            });
          }
        });
        
        setPositions(newPositions);
      }
    };

    // Initial update
    const timer = setTimeout(updatePositions, 100);
    
    // Listen to resize and scroll
    window.addEventListener('resize', updatePositions);
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', updatePositions);
    }
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', updatePositions);
      }
    };
  }, [rootDigimonId, treeDigimon]);

  // Get connections to draw with angular lines
  const getAngularConnections = () => {
    // Count connections for each Digimon to distribute ports
    const fromCounts: Record<string, number> = {};
    const toCounts: Record<string, number> = {};
    const fromIndices: Record<string, number> = {};
    const toIndices: Record<string, number> = {};
    
    // Count how many evolutions from/to each Digimon
    treeEvolutions.forEach(evo => {
      fromCounts[evo.from] = (fromCounts[evo.from] || 0) + 1;
      toCounts[evo.to] = (toCounts[evo.to] || 0) + 1;
      fromIndices[evo.from] = 0;
      toIndices[evo.to] = 0;
    });
    
    return treeEvolutions.map(evo => {
      const fromPos = positions.find(p => p.id === evo.from);
      const toPos = positions.find(p => p.id === evo.to);
      if (!fromPos || !toPos) return null;
      
      const cardWidth = 80; // Match the card width from the component
      const cardHeight = 80; // Match the card height
      const borderWidth = 3; // Border thickness
      
      // Calculate offset for this connection
      const fromCount = fromCounts[evo.from];
      const fromIndex = fromIndices[evo.from]++;
      const toCount = toCounts[evo.to];
      const toIndex = toIndices[evo.to]++;
      
      // Distribute connection points evenly across the card width
      const getOffset = (index: number, total: number) => {
        if (total === 1) return 0; // Center
        const spacing = cardWidth * 0.6; // Use 60% of card width for distribution
        const step = spacing / (total - 1);
        return (index * step) - (spacing / 2);
      };
      
      const fromOffset = getOffset(fromIndex, fromCount);
      const toOffset = getOffset(toIndex, toCount);
      
      // Adjust positions with offsets
      const fromX = fromPos.x + fromOffset;
      const toX = toPos.x + toOffset;
      
      // Adjust Y positions to connect to the outer edge of the cards
      // fromY: bottom edge of the parent card (including border)
      // toY: top edge of the child card (including border)
      const fromY = fromPos.y + (cardHeight / 2) + borderWidth;
      const toY = toPos.y - (cardHeight / 2) - borderWidth;
      
      // Create angular path: vertical then horizontal
      const midY = (fromY + toY) / 2;
      
      return {
        from: fromPos,
        to: toPos,
        path: `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`
      };
    }).filter(conn => conn !== null);
  };

  const currentRootDigimon = digimonData.find(d => d.id === rootDigimonId);

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-[#272822]' : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300'}`}>
      {/* Header */}
      <header className="text-white sticky top-0 z-50 shadow-lg flex-shrink-0" style={{ backgroundColor: headerColor }}>
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10"></div> {/* Spacer for alignment */}
            
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

          {/* Navigation Tabs */}
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

          {/* Color Picker */}
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white opacity-90">Theme:</label>
              <input
                type="color"
                value={headerColor}
                onChange={(e) => {
                  setHeaderColor(e.target.value);
                  setLineColor(e.target.value);
                }}
                className="w-8 h-8 rounded cursor-pointer border-2 border-white"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search Digimon..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-[#3e3d32] text-[#f8f8f2] placeholder-gray-500' 
                  : 'bg-white/90 text-gray-900 placeholder-gray-500'
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
      </header>

      {/* Root Digimon Title */}
      {currentRootDigimon && (
        <div className="px-4 py-4 flex-shrink-0">
          <h2 className={`text-2xl text-center ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>
            {currentRootDigimon.name}
          </h2>
        </div>
      )}

      {/* Main Content - Scrollable */}
      <div className="relative flex-1 overflow-y-auto overflow-x-hidden" ref={containerRef}>
        {/* Digimon by Stage (with background wrapper) */}
        <div className="relative z-0 px-4 py-6 space-y-8">
          {stageOrder.map(stage => {
            const digimons = digimonByStage[stage];
            if (digimons.length === 0) return null;

            return (
              <div key={stage} className="flex justify-center">
                <div 
                  className={`w-full max-w-full rounded-2xl p-6 ${
                    darkMode 
                      ? 'bg-[#3e3d32]/60' 
                      : 'bg-white/40'
                  }`}
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <div className="flex flex-wrap gap-3 justify-center">
                    {digimons.map(digimon => (
                      <button
                        key={digimon.id}
                        data-digimon-id={digimon.id}
                        onClick={() => onDigimonClick(digimon.id)}
                        className="relative group z-20"
                        style={{
                          width: '80px',
                          height: '80px',
                        }}
                      >
                        {(() => {
                          const isArmor = ARMOR_IDS.has(digimon.id);
                          const borderColor = isArmor ? ARMOR_COLOR : lineColor;
                          return (
                        <div
                          className={`w-full h-full rounded-lg overflow-hidden transition-transform group-hover:scale-110 shadow-md flex items-center justify-center ${
                            darkMode ? 'bg-[#49483e]' : 'bg-gray-50'
                          }`}
                          style={{
                            border: `3px solid ${borderColor}`,
                          }}
                        >
                          <img
                            src={digimon.image}
                            alt={digimon.name}
                            className="mx-auto block"
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                          />
                        </div>
                          );
                        })()}
                        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded shadow-sm z-30 ${
                          darkMode ? 'bg-[#49483e] text-[#f8f8f2]' : 'bg-white text-gray-700'
                        }`}>
                          {digimon.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>



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