interface EvolutionTabNavigationProps {
  activeTab: 'evolutions' | 'dna';
  onTabChange: (tab: 'evolutions' | 'dna') => void;
  hasDnaData: boolean;
  darkMode?: boolean;
}

export function EvolutionTabNavigation({
  activeTab,
  onTabChange,
  hasDnaData,
  darkMode,
}: EvolutionTabNavigationProps) {
  const activeClasses = darkMode
    ? 'border-b-2 border-blue-400 text-blue-400 font-bold'
    : 'border-b-2 border-blue-500 text-blue-600 font-bold';
  const inactiveClasses = darkMode
    ? 'text-[#a6a49f] hover:text-[#f8f8f2] bg-[#49483e] hover:bg-[#5a5951] font-medium'
    : 'text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 font-medium';
  const disabledClasses = darkMode
    ? 'text-[#5a5a52] cursor-not-allowed bg-[#49483e] font-medium'
    : 'text-gray-400 cursor-not-allowed bg-gray-50 font-medium';

  return (
    <div className={`flex border-b ${darkMode ? 'border-[#49483e]' : 'border-gray-200'}`}>
      <button
        onClick={() => onTabChange('evolutions')}
        className={`flex-1 px-4 py-3 text-sm transition-colors ${
          activeTab === 'evolutions' ? activeClasses : inactiveClasses
        }`}
      >
        Evolutions
      </button>
      <button
        onClick={() => hasDnaData && onTabChange('dna')}
        disabled={!hasDnaData}
        className={`flex-1 px-4 py-3 text-sm transition-colors ${
          !hasDnaData ? disabledClasses : activeTab === 'dna' ? activeClasses : inactiveClasses
        }`}
      >
        DNA Evolution
      </button>
    </div>
  );
}
