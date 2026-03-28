import { X, Plus, Sun, Moon } from 'lucide-react';
import { Digimon } from '../../types/digimon';

interface TeamSlotProps {
  digimon: Digimon | null;
  index: number;
  isSelected: boolean;
  isDesktop: boolean;
  themeColor: string;
  darkMode: boolean;
  onSlotClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onSwitch: (e: React.MouseEvent) => void;
}

export function TeamSlot({
  digimon,
  index,
  isSelected,
  isDesktop,
  themeColor,
  darkMode,
  onSlotClick,
  onRemove,
  onSwitch,
}: TeamSlotProps) {
  return (
    <div
      onClick={onSlotClick}
      className={`relative group rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:z-20 ${
        darkMode ? 'bg-[#49483e]' : 'bg-gray-50'
      } ${isSelected ? 'ring-4' : ''}`}
      style={{
        width: isDesktop ? '200px' : '100%',
        height: isDesktop ? '200px' : undefined,
        aspectRatio: isDesktop ? undefined : '1 / 1',
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: digimon ? themeColor : darkMode ? '#75715e' : '#d1d5db',
        ...(isSelected && ({ '--tw-ring-color': themeColor } as React.CSSProperties)),
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSlotClick();
        }
      }}
    >
      {digimon ? (
        <>
          <button
            aria-label="Remove from team"
            onClick={onRemove}
            className="absolute top-0.5 left-0.5 z-30 rounded-full bg-red-600 text-white hover:bg-red-700 shadow ring-2 ring-white/80"
            style={{ left: '4px', right: 'auto', padding: isDesktop ? '6px' : '4px' }}
          >
            <X size={isDesktop ? 18 : 12} />
          </button>

          <button
            aria-label="Switch Digimon"
            onClick={onSwitch}
            className="absolute top-0.5 right-0.5 z-30 rounded font-medium shadow hover:opacity-90"
            style={{
              backgroundColor: themeColor,
              color: '#ffffff',
              right: '4px',
              left: 'auto',
              padding: isDesktop ? '6px 8px' : '4px 6px',
              fontSize: isDesktop ? '10px' : '9px',
            }}
          >
            Switch
          </button>

          <div
            className="w-full h-full flex flex-col items-center"
            style={{ padding: isDesktop ? '20px' : '12px' }}
          >
            <div
              className="w-full h-full flex items-center justify-center mb-1"
              style={{ maxHeight: isDesktop ? '70%' : '60%' }}
            >
              <img
                src={digimon.image}
                alt={digimon.name}
                className="object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
            <div className="text-center w-full" style={{ maxHeight: isDesktop ? '30%' : '40%' }}>
              <div
                className={`font-medium truncate max-w-full flex items-center justify-center gap-1 ${
                  darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'
                }`}
                style={{ fontSize: isDesktop ? '0.875rem' : '11px' }}
              >
                {digimon.exclusive && (
                  digimon.exclusive === 'Dawn' ? (
                    <Sun
                      className="text-yellow-400 drop-shadow-md flex-shrink-0"
                      fill="currentColor"
                      style={{ width: '16px', height: '16px' }}
                    />
                  ) : (
                    <Moon
                      className="text-blue-300 drop-shadow-md flex-shrink-0"
                      fill="currentColor"
                      style={{ width: '16px', height: '16px' }}
                    />
                  )
                )}
                <span className="truncate">{digimon.name}</span>
              </div>
              <div
                className={`${isDesktop ? 'text-xs' : ''} mt-0.5 ${
                  darkMode ? 'text-[#a6a49f]' : 'text-gray-600'
                }`}
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  ...(isDesktop ? {} : { fontSize: '9px' }),
                }}
              >
                {digimon.stage}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center">
            <Plus
              size={48}
              className={`${darkMode ? 'text-[#75715e]' : 'text-gray-400'} mx-auto block`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
