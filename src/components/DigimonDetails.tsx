import { Digimon } from '../types/digimon';
import { X } from 'lucide-react';
import { evolutions, digimonData } from '../data/digimon-data';
import rawDnaData from '../evolution_data/evo_dna.json';
import { useState } from 'react';

interface DigimonDetailsProps {
  digimon: Digimon;
  onClose: () => void;
  onDigimonClick?: (digimon: Digimon) => void;
  darkMode?: boolean;
}

export function DigimonDetails({ digimon, onClose, onDigimonClick, darkMode }: DigimonDetailsProps) {
  const [activeTab, setActiveTab] = useState<'evolutions' | 'dna'>('evolutions');

  // Get evolutions from and to this Digimon
  const evolvesFrom = evolutions.filter(evo => evo.to === digimon.id);
  const evolvesTo = evolutions.filter(evo => evo.from === digimon.id);

  // DNA evolution data for this Digimon (keyed by display name in JSON)
  const dnaEntry = (rawDnaData as Record<string, any>)[digimon.name];
  const dnaReqs = dnaEntry?.dnaReqs;
  const possibleDigimon = dnaReqs?.possibleDigimon as any[] | undefined;
  const dnaEvoReqs = dnaReqs?.evoReqs as Record<string, any> | undefined;
  const dnaEvolvesInto = dnaEntry?.dnaEvolvesInto as string[] | undefined;
  
  // Collect DNA degen entries where THIS digimon is the target
  const dnaDegensForTarget: Array<{ sourceName: string; target: string; neededDigimon: any[]; befriended?: any }> = (() => {
    const results: Array<{ sourceName: string; target: string; neededDigimon: any[]; befriended?: any }> = [];
    const all = rawDnaData as Record<string, any>;
    Object.entries(all).forEach(([sourceName, data]) => {
      const entries = data?.dnaDegensInto as Array<any> | undefined;
      if (!entries) return;
      entries.forEach((degen: any) => {
        const targetName = degen?.target;
        if (typeof targetName === 'string' && targetName === digimon.name) {
          results.push({
            sourceName,
            target: targetName,
            neededDigimon: Array.isArray(degen.neededDigimon) ? degen.neededDigimon : [],
            befriended: degen.befriended
          });
        }
      });
    });
    return results;
  })();

  const hasDnaData = !!dnaReqs;
  const hasEvolutionData = evolvesFrom.length > 0 || evolvesTo.length > 0;

  const formatDnaRequirements = (reqs: Record<string, any> | undefined): string | undefined => {
    if (!reqs || Object.keys(reqs).length === 0) return undefined;
    const requirements: string[] = [];
    Object.entries(reqs).forEach(([key, value]) => {
      const valueStr = String(value);
      const containsBefriend = valueStr.toLowerCase().includes('befriend');
      const shouldAddPlus = typeof value === 'number' && !containsBefriend;
      const suffix = shouldAddPlus ? '+' : '';

      if (key === 'level') {
        requirements.push(`Level ${value}${suffix}`);
      } else if (key.endsWith('Exp')) {
        const formatted = key.replace(/Exp$/, '').replace(/([A-Z])/g, ' $1').trim();
        const capitalized = formatted
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        requirements.push(`${capitalized} EXP ${value}${suffix}`);
      } else if (key === 'friendship') {
        requirements.push(`Friendship ${value}${suffix}`);
      } else if (key === 'attack') {
        requirements.push(`Attack ${value}${suffix}`);
      } else if (key === 'defense') {
        requirements.push(`Defense ${value}${suffix}`);
      } else if (key === 'speed') {
        requirements.push(`Speed ${value}${suffix}`);
      } else if (key === 'spirit') {
        requirements.push(`Spirit ${value}${suffix}`);
      } else if (key === 'aptitude') {
        requirements.push(`Aptitude ${value}${suffix}`);
      } else if (key === 'totalExp') {
        requirements.push(`Total EXP ${value}${suffix}`);
      } else if (key === 'befriended') {
        if (Array.isArray(value)) {
          requirements.push(`Befriended ${value.join(', ')}`);
        } else {
          requirements.push(`Befriended ${value}`);
        }
      } else {
        requirements.push(`${key} ${value}${suffix}`);
      }
    });
    return requirements.length > 0 ? requirements.join(',\n') : undefined;
  };

  const formattedDnaReqs = formatDnaRequirements(dnaEvoReqs);

  const normalizeId = (name: string) => name?.toLowerCase().replace(/\s+/g, '') || '';
  const getByNameOrId = (name: string) => {
    const byName = digimonData.find(d => d.name === name);
    if (byName) return byName;
    const id = normalizeId(name);
    return digimonData.find(d => d.id === id);
  };
  
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
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <img 
              src={digimon.image} 
              alt={digimon.name}
              className="object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
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

      {/* Tab Navigation */}
      <div className={`flex border-b ${darkMode ? 'border-[#49483e]' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('evolutions')}
          className={`flex-1 px-4 py-3 text-sm transition-colors ${
            activeTab === 'evolutions'
              ? darkMode
                ? 'border-b-2 border-blue-400 text-blue-400 font-bold'
                : 'border-b-2 border-blue-500 text-blue-600 font-bold'
              : darkMode
              ? 'text-[#a6a49f] hover:text-[#f8f8f2] bg-[#49483e] hover:bg-[#5a5951] font-medium'
              : 'text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 font-medium'
          }`}
        >
          Evolutions
        </button>
        <button
          onClick={() => hasDnaData && setActiveTab('dna')}
          disabled={!hasDnaData}
          className={`flex-1 px-4 py-3 text-sm transition-colors ${
            !hasDnaData
              ? darkMode
                ? 'text-[#5a5a52] cursor-not-allowed bg-[#49483e] font-medium'
                : 'text-gray-400 cursor-not-allowed bg-gray-50 font-medium'
              : activeTab === 'dna'
              ? darkMode
                ? 'border-b-2 border-blue-400 text-blue-400 font-bold'
                : 'border-b-2 border-blue-500 text-blue-600 font-bold'
              : darkMode
              ? 'text-[#a6a49f] hover:text-[#f8f8f2] bg-[#49483e] hover:bg-[#5a5951] font-medium'
              : 'text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 font-medium'
          }`}
        >
          DNA Evolution
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Evolutions Tab */}
        {activeTab === 'evolutions' && (
          <>
            {/* Evolves From Section */}
            {evolvesFrom.length > 0 && (
              <div>
                <h3 className={`mb-3 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>Evolves From</h3>
                <div className="space-y-3">
                  {evolvesFrom.map(evo => {
                    const fromDigimon = digimonData.find(d => d.id === evo.from);
                    if (!fromDigimon) return null;
                    
                    return (
                      <div 
                        key={evo.from} 
                        onClick={() => onDigimonClick?.(fromDigimon)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          darkMode ? 'bg-[#49483e] hover:bg-[#5a5951]' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <img 
                          src={fromDigimon.image} 
                          alt={fromDigimon.name}
                          className="rounded object-contain"
                          style={{ maxWidth: '3rem', maxHeight: '3rem' }}
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
                      <div 
                        key={evo.to} 
                        onClick={() => onDigimonClick?.(toDigimon)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          darkMode ? 'bg-[#49483e] hover:bg-[#5a5951]' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <img 
                          src={toDigimon.image} 
                          alt={toDigimon.name}
                          className="rounded object-contain"
                          style={{ maxWidth: '3rem', maxHeight: '3rem' }}
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
            {!hasEvolutionData && (
              <div className={`text-center py-4 ${darkMode ? 'text-[#a6a49f]' : 'text-gray-500'}`}>
                No evolution data available
              </div>
            )}
          </>
        )}

        {/* DNA Evolution Tab */}
        {activeTab === 'dna' && (
          <>
            {/* Evolves From Section */}
            {dnaReqs && (
              <div>
                <h3 className={`mb-3 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>Evolves From</h3>
                <div className="space-y-3">
                  {/* Possible partner options with icons */}
                  {Array.isArray(possibleDigimon) && possibleDigimon.length > 0 && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#49483e]' : 'bg-gray-50'}`}>
                      <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>Possible Partners</div>
                      <div className="space-y-2">
                        {possibleDigimon.map((entry, i) => {
                          if (typeof entry === 'string') {
                            const partner = getByNameOrId(entry);
                            return (
                              <div 
                                key={i} 
                                onClick={() => partner && onDigimonClick?.(partner)}
                                className={`flex items-center gap-2 cursor-pointer transition-colors ${
                                  partner ? (darkMode ? 'hover:text-blue-400' : 'hover:text-blue-600') : ''
                                }`}
                              >
                                {partner && (
                                  <img src={partner.image} alt={partner.name} className="rounded object-contain" style={{ maxWidth: '2rem', maxHeight: '2rem' }} />
                                )}
                                <span className={`${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'} text-sm`}>{entry}</span>
                              </div>
                            );
                          }
                          if (entry && typeof entry === 'object') {
                            const d1Name = entry.digi1 || entry.digimon || entry[0];
                            const d2Name = entry.digi2 || entry[1];
                            const d1 = d1Name ? getByNameOrId(d1Name) : undefined;
                            const d2 = d2Name ? getByNameOrId(d2Name) : undefined;
                            return (
                              <div key={i} className="flex items-center gap-2">
                                {d1 && (
                                  <img 
                                    src={d1.image} 
                                    alt={d1.name} 
                                    onClick={() => onDigimonClick?.(d1)}
                                    className="rounded object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                    style={{ maxWidth: '2rem', maxHeight: '2rem' }}
                                  />
                                )}
                                <span 
                                  onClick={() => d1 && onDigimonClick?.(d1)}
                                  className={`${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'} text-sm cursor-pointer transition-colors ${
                                    d1 ? (darkMode ? 'hover:text-blue-400' : 'hover:text-blue-600') : ''
                                  }`}
                                >{d1Name}</span>
                                <span className={`${darkMode ? 'text-[#a6a49f]' : 'text-gray-500'} text-xs`}>+</span>
                                {d2 && (
                                  <img 
                                    src={d2.image} 
                                    alt={d2.name} 
                                    onClick={() => onDigimonClick?.(d2)}
                                    className="rounded object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                    style={{ maxWidth: '2rem', maxHeight: '2rem' }}
                                  />
                                )}
                                <span 
                                  onClick={() => d2 && onDigimonClick?.(d2)}
                                  className={`${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'} text-sm cursor-pointer transition-colors ${
                                    d2 ? (darkMode ? 'hover:text-blue-400' : 'hover:text-blue-600') : ''
                                  }`}
                                >{d2Name}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#49483e]' : 'bg-gray-50'}`}>
                    <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>Requirements</div>
                    <div className={`text-sm ${darkMode ? 'text-[#a6a49f]' : 'text-gray-600'}`}>
                      {formattedDnaReqs ? (
                        formattedDnaReqs.split('\n').map((line, i) => <div key={i}>{line}</div>)
                      ) : (
                        'No requirements'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* No DNA evolution message */}
            {!hasDnaData && (
              <div className={`text-center py-4 ${darkMode ? 'text-[#a6a49f]' : 'text-gray-500'}`}>
                No DNA evolution data available
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
