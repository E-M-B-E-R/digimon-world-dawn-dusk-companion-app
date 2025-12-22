import { Digimon } from '../types/digimon';
import { X } from 'lucide-react';

interface DigimonDetailsProps {
  digimon: Digimon;
  onClose: () => void;
}

export function DigimonDetails({ digimon, onClose }: DigimonDetailsProps) {
  const stageColors = {
    'Fresh': 'from-gray-400 to-gray-600',
    'In-Training': 'from-green-400 to-green-600',
    'Rookie': 'from-blue-400 to-blue-600',
    'Champion': 'from-yellow-400 to-yellow-600',
    'Ultimate': 'from-purple-400 to-purple-600',
    'Mega': 'from-red-400 to-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full mx-4">
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
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm text-gray-500 mb-2">Description</h3>
          <p className="text-gray-800">{digimon.description}</p>
        </div>

        {digimon.stats && (
          <div>
            <h3 className="text-sm text-gray-500 mb-3">Stats</h3>
            <div className="space-y-2">
              {Object.entries(digimon.stats).map(([stat, value]) => (
                <div key={stat} className="flex items-center gap-2">
                  <div className="w-20 text-sm text-gray-600 capitalize">{stat}</div>
                  <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stageColors[digimon.stage]} transition-all`}
                      style={{ width: `${Math.min(100, (value / 300) * 100)}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-right">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
