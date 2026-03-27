import { X, Sun, Moon } from 'lucide-react';
import { Digimon } from '../../types/digimon';
import { STAGE_GRADIENT_COLORS } from '../../constants/stageColors';

interface DigimonDetailsHeaderProps {
  digimon: Digimon;
  onClose: () => void;
}

export function DigimonDetailsHeader({ digimon, onClose }: DigimonDetailsHeaderProps) {
  return (
    <div className={`bg-gradient-to-r ${STAGE_GRADIENT_COLORS[digimon.stage]} p-6 text-white relative`}>
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
          <div className="flex items-center gap-2">
            {digimon.exclusive && (
              digimon.exclusive === 'Dawn' ? (
                <Sun className="text-yellow-300" fill="currentColor" style={{ width: '16px', height: '16px' }} />
              ) : (
                <Moon className="text-blue-200" fill="currentColor" style={{ width: '16px', height: '16px' }} />
              )
            )}
            <h2 className="text-2xl mb-1">{digimon.name}</h2>
          </div>
          <div className="text-sm opacity-90">{digimon.stage}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {digimon.type.map(type => (
              <span key={type} className="px-2 py-1 bg-white/20 rounded text-xs">
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
