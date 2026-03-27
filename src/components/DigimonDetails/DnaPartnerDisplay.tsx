import { Sun, Moon } from 'lucide-react';
import { Digimon } from '../../types/digimon';
import { digimonData } from '../../data/digimon-data';

interface DnaPartnerDisplayProps {
  possibleDigimon: any[];
  onDigimonClick?: (digimon: Digimon) => void;
  darkMode?: boolean;
}

const normalizeId = (name: string) => name?.toLowerCase().replace(/\s+/g, '') || '';

const getByNameOrId = (name: string): Digimon | undefined => {
  const byName = digimonData.find(d => d.name === name);
  if (byName) return byName;
  const id = normalizeId(name);
  return digimonData.find(d => d.id === id);
};

function ExclusiveIcon({ exclusive }: { exclusive?: 'Dawn' | 'Dusk' }) {
  if (!exclusive) return null;
  return exclusive === 'Dawn' ? (
    <Sun className="text-yellow-300" fill="currentColor" style={{ width: '16px', height: '16px' }} />
  ) : (
    <Moon className="text-blue-200" fill="currentColor" style={{ width: '16px', height: '16px' }} />
  );
}

export function DnaPartnerDisplay({ possibleDigimon, onDigimonClick, darkMode }: DnaPartnerDisplayProps) {
  return (
    <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#49483e]' : 'bg-gray-50'}`}>
      <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>
        Possible Partners
      </div>
      <div>
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
                style={{ marginBottom: '16px' }}
              >
                {partner && (
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="rounded object-contain"
                    style={{ maxWidth: '2rem', maxHeight: '2rem' }}
                  />
                )}
                <div className="flex items-center gap-1">
                  <ExclusiveIcon exclusive={partner?.exclusive} />
                  <span className={`${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'} text-sm`}>
                    {entry}
                  </span>
                </div>
              </div>
            );
          }

          if (entry && typeof entry === 'object') {
            const d1Name = entry.digi1 || entry.digimon || entry[0];
            const d2Name = entry.digi2 || entry[1];
            const d1 = d1Name ? getByNameOrId(d1Name) : undefined;
            const d2 = d2Name ? getByNameOrId(d2Name) : undefined;

            return (
              <div key={i} className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
                {d1 && (
                  <img
                    src={d1.image}
                    alt={d1.name}
                    onClick={() => onDigimonClick?.(d1)}
                    className="rounded object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ maxWidth: '2rem', maxHeight: '2rem' }}
                  />
                )}
                <div className="flex items-center gap-1">
                  <ExclusiveIcon exclusive={d1?.exclusive} />
                  <span
                    onClick={() => d1 && onDigimonClick?.(d1)}
                    className={`${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'} text-sm cursor-pointer transition-colors ${
                      d1 ? (darkMode ? 'hover:text-blue-400' : 'hover:text-blue-600') : ''
                    }`}
                  >
                    {d1Name}
                  </span>
                </div>
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
                <div className="flex items-center gap-1">
                  <ExclusiveIcon exclusive={d2?.exclusive} />
                  <span
                    onClick={() => d2 && onDigimonClick?.(d2)}
                    className={`${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'} text-sm cursor-pointer transition-colors ${
                      d2 ? (darkMode ? 'hover:text-blue-400' : 'hover:text-blue-600') : ''
                    }`}
                  >
                    {d2Name}
                  </span>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
