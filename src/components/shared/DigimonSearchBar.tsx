import { useRef } from 'react';
import { Search, Sun, Moon } from 'lucide-react';
import { Digimon } from '../../types/digimon';

interface DigimonSearchBarProps {
  query: string;
  suggestions: Digimon[];
  showSuggestions: boolean;
  onSearch: (q: string) => void;
  onFocus?: () => void;
  onSelect: (digimon: Digimon) => void;
  placeholder?: string;
  disabled?: boolean;
  darkMode?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  /** Show stage • type subtitle in suggestions */
  showType?: boolean;
  /** Show Dawn/Dusk exclusive icon in suggestions */
  showExclusive?: boolean;
  /** Prevent input from losing focus when clicking a suggestion (needed for MyTeam) */
  keepFocusOnSelect?: boolean;
}

export function DigimonSearchBar({
  query,
  suggestions,
  showSuggestions,
  onSearch,
  onFocus,
  onSelect,
  placeholder = 'Search Digimon...',
  disabled = false,
  darkMode,
  inputRef,
  showType = false,
  showExclusive = false,
  keepFocusOnSelect = false,
}: DigimonSearchBarProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = (inputRef || internalRef) as React.RefObject<HTMLInputElement>;

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={e => onSearch(e.target.value)}
        onFocus={() => query && onFocus?.()}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
          darkMode
            ? 'bg-[#49483e] text-[#f8f8f2] placeholder-gray-500 border border-[#75715e] focus:ring-[#a6a49f]'
            : 'bg-gray-50 border border-gray-300 focus:ring-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          data-testid="search-suggestions"
          className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl border max-h-96 overflow-y-auto z-50 ${
            darkMode ? 'bg-[#49483e] border-[#75715e]' : 'bg-white border-gray-200'
          }`}
          onMouseDown={keepFocusOnSelect ? e => e.preventDefault() : undefined}
        >
          {suggestions.map(d => (
            <button
              key={d.id}
              onPointerDown={
                keepFocusOnSelect
                  ? e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  : undefined
              }
              onClick={e => {
                if (keepFocusOnSelect) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                onSelect(d);
              }}
              className={`w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 ${
                darkMode
                  ? 'hover:bg-[#3e3d32] border-[#75715e]'
                  : 'hover:bg-gray-100 border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={d.image}
                  alt={d.name}
                  className="rounded object-contain"
                  style={{ maxWidth: '3rem', maxHeight: '3rem' }}
                />
                <div>
                  <div
                    className={`flex items-center gap-1 ${
                      darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'
                    }`}
                  >
                    {showExclusive && d.exclusive && (
                      d.exclusive === 'Dawn' ? (
                        <Sun
                          aria-label="Dawn exclusive"
                          role="img"
                          className="text-yellow-400 drop-shadow-md flex-shrink-0"
                          fill="currentColor"
                          style={{ width: '16px', height: '16px' }}
                        />
                      ) : (
                        <Moon
                          aria-label="Dusk exclusive"
                          role="img"
                          className="text-blue-300 drop-shadow-md flex-shrink-0"
                          fill="currentColor"
                          style={{ width: '16px', height: '16px' }}
                        />
                      )
                    )}
                    <span>{d.name}</span>
                  </div>
                  <div className={darkMode ? 'text-xs text-[#a6a49f]' : 'text-xs text-gray-600'}>
                    {d.stage}
                    {showType ? ` • ${d.type.join(', ')}` : ''}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
