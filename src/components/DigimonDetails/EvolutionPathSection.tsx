import { Digimon, Evolution } from '../../types/digimon';
import { digimonData } from '../../data/digimon-data';

interface EvolutionPathSectionProps {
  title: 'Evolves From' | 'Evolves To';
  evolutions: Evolution[];
  onDigimonClick?: (digimon: Digimon) => void;
  darkMode?: boolean;
}

export function EvolutionPathSection({
  title,
  evolutions,
  onDigimonClick,
  darkMode,
}: EvolutionPathSectionProps) {
  if (evolutions.length === 0) return null;

  return (
    <div>
      <h3 className={`mb-3 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>{title}</h3>
      <div className="space-y-3">
        {evolutions.map(evo => {
          const targetId = title === 'Evolves From' ? evo.from : evo.to;
          const targetDigimon = digimonData.find(d => d.id === targetId);
          if (!targetDigimon) return null;

          return (
            <div
              key={targetId}
              onClick={() => onDigimonClick?.(targetDigimon)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                darkMode ? 'bg-[#49483e] hover:bg-[#5a5951]' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <img
                src={targetDigimon.image}
                alt={targetDigimon.name}
                className="rounded object-contain"
                style={{ maxWidth: '3rem', maxHeight: '3rem' }}
              />
              <div className="flex-1">
                <div className={darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}>{targetDigimon.name}</div>
                <div className={`text-sm ${darkMode ? 'text-[#a6a49f]' : 'text-gray-600'}`}>
                  {evo.requirements ? (
                    evo.requirements.split('\n').map((line, i) => <div key={i}>{line}</div>)
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
  );
}
