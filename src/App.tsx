import { useState } from 'react';
import { Search } from 'lucide-react';
import { digimonData, evolutions } from './data/digimon-data';
import { EvolutionTreeGraph } from './components/EvolutionTreeGraph';
import { DigimonDetails } from './components/DigimonDetails';

export default function App() {
  const [selectedDigimon, setSelectedDigimon] = useState<string>('agumon');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof digimonData>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-[95%] mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl text-gray-900">
                Digimon Evolution Tree
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Digimon World: Dusk & Dawn
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Digimon..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {suggestions.map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleSelectFromSearch(d.id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={d.image} 
                          alt={d.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <div className="text-gray-900">{d.name}</div>
                          <div className="text-xs text-gray-600">{d.stage} • {d.type.join(', ')}</div>
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
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="mb-4">
            <h2 className="text-xl text-gray-800">
              {currentDigimon?.name} Evolution Tree
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Click on any Digimon to view details and change the evolution tree view
            </p>
          </div>

          <EvolutionTreeGraph
            rootDigimonId={selectedDigimon}
            digimonData={digimonData}
            evolutions={evolutions}
            onDigimonClick={handleDigimonClick}
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