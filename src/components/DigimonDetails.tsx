import { Digimon } from '../types/digimon';
import { X } from 'lucide-react';
import { evolutions, digimonData } from '../data/digimon-data';

interface DigimonDetailsProps {
  digimon: Digimon;
  onClose: () => void;
  darkMode?: boolean;
}

export function DigimonDetails({ digimon, onClose, darkMode }: DigimonDetailsProps) {
  // Get evolutions from and to this Digimon
  const evolvesFrom = evolutions.filter(evo => evo.to === digimon.id);
  const evolvesTo = evolutions.filter(evo => evo.from === digimon.id);
  
  const stageColors = {
    'In-Training': 'from-green-400 to-green-600',
    'Rookie': 'from-blue-400 to-blue-600',
    'Champion': 'from-yellow-400 to-yellow-600',
    'Ultimate': 'from-purple-400 to-purple-600',
    'Mega': 'from-red-400 to-red-600'
  };

  return (
    <div className={`rounded-xl shadow-2xl overflow-hidden max-w-md w-full mx-4 ${
      darkMode ? 'bg-[#3e3d32]' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${stageColors[digimon.stage]} p-6 text-white relative`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm">
            <img 
              src={digimon.image} 
              alt={digimon.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl mb-1">{digimon.name}</h2>
            <div className="text-sm opacity-90">{digimon.stage}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {digimon.type.map(type => (
                <span 
                  key={type} 
                  className="px-2 py-1 bg-white/20 rounded text-xs"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Evolves From Section */}
        {evolvesFrom.length > 0 && (
          <div>
            <h3 className={`mb-3 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>Evolves From</h3>
            <div className="space-y-3">
              {evolvesFrom.map(evo => {
                const fromDigimon = digimonData.find(d => d.id === evo.from);
                if (!fromDigimon) return null;
                
                return (
                  <div key={evo.from} className={`flex items-center gap-3 p-3 rounded-lg ${
                    darkMode ? 'bg-[#49483e]' : 'bg-gray-50'
                  }`}>
                    <img 
                      src={fromDigimon.image} 
                      alt={fromDigimon.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className={darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}>{fromDigimon.name}</div>
                      <div className={`text-sm ${darkMode ? 'text-[#a6a49f]' : 'text-gray-600'}`}>
                        {evo.requirements ? (
                          evo.requirements.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))
                        ) : (
                          'No requirements'
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Evolves To Section */}
        {evolvesTo.length > 0 && (
          <div>
            <h3 className={`mb-3 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>Evolves To</h3>
            <div className="space-y-3">
              {evolvesTo.map(evo => {
                const toDigimon = digimonData.find(d => d.id === evo.to);
                if (!toDigimon) return null;
                
                return (
                  <div key={evo.to} className={`flex items-center gap-3 p-3 rounded-lg ${
                    darkMode ? 'bg-[#49483e]' : 'bg-gray-50'
                  }`}>
                    <img 
                      src={toDigimon.image} 
                      alt={toDigimon.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className={darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}>{toDigimon.name}</div>
                      <div className={`text-sm ${darkMode ? 'text-[#a6a49f]' : 'text-gray-600'}`}>
                        {evo.requirements ? (
                          evo.requirements.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))
                        ) : (
                          'No requirements'
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No evolutions message */}
        {evolvesFrom.length === 0 && evolvesTo.length === 0 && (
          <div className={`text-center py-4 ${darkMode ? 'text-[#a6a49f]' : 'text-gray-500'}`}>
            No evolution data available
          </div>
        )}
      </div>
    </div>
  );
}