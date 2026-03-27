import { useState } from 'react';
import { Digimon } from '../../types/digimon';
import { evolutions } from '../../data/digimon-data';
import rawDnaData from '../../evolution_data/evo_dna.json';
import { useEvolutionRequirements } from '../../hooks/useEvolutionRequirements';
import { DigimonDetailsHeader } from './DigimonDetailsHeader';
import { EvolutionTabNavigation } from './EvolutionTabNavigation';
import { EvolutionPathSection } from './EvolutionPathSection';
import { DnaPartnerDisplay } from './DnaPartnerDisplay';
import { DnaRequirementsBox } from './DnaRequirementsBox';

interface DigimonDetailsProps {
  digimon: Digimon;
  onClose: () => void;
  onDigimonClick?: (digimon: Digimon) => void;
  darkMode?: boolean;
}

export function DigimonDetails({ digimon, onClose, onDigimonClick, darkMode }: DigimonDetailsProps) {
  const [activeTab, setActiveTab] = useState<'evolutions' | 'dna'>('evolutions');
  const { formatRequirements } = useEvolutionRequirements();

  const evolvesFrom = evolutions.filter(evo => evo.to === digimon.id);
  const evolvesTo = evolutions.filter(evo => evo.from === digimon.id);

  const dnaEntry = (rawDnaData as Record<string, any>)[digimon.name];
  const dnaReqs = dnaEntry?.dnaReqs;
  const possibleDigimon = dnaReqs?.possibleDigimon as any[] | undefined;
  const dnaEvoReqs = dnaReqs?.evoReqs as Record<string, any> | undefined;

  const hasDnaData = !!dnaReqs;
  const hasEvolutionData = evolvesFrom.length > 0 || evolvesTo.length > 0;
  const formattedDnaReqs = formatRequirements(dnaEvoReqs);

  return (
    <div
      className={`rounded-xl shadow-2xl overflow-hidden max-w-md w-full mx-4 ${
        darkMode ? 'bg-[#3e3d32]' : 'bg-white'
      }`}
    >
      <DigimonDetailsHeader digimon={digimon} onClose={onClose} />

      <EvolutionTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasDnaData={hasDnaData}
        darkMode={darkMode}
      />

      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {activeTab === 'evolutions' && (
          <>
            <EvolutionPathSection
              title="Evolves From"
              evolutions={evolvesFrom}
              onDigimonClick={onDigimonClick}
              darkMode={darkMode}
            />
            <EvolutionPathSection
              title="Evolves To"
              evolutions={evolvesTo}
              onDigimonClick={onDigimonClick}
              darkMode={darkMode}
            />
            {!hasEvolutionData && (
              <div className={`text-center py-4 ${darkMode ? 'text-[#a6a49f]' : 'text-gray-500'}`}>
                No evolution data available
              </div>
            )}
          </>
        )}

        {activeTab === 'dna' && (
          <>
            {dnaReqs ? (
              <div>
                <h3 className={`mb-3 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>
                  Evolves From
                </h3>
                <div className="space-y-3">
                  {Array.isArray(possibleDigimon) && possibleDigimon.length > 0 && (
                    <DnaPartnerDisplay
                      possibleDigimon={possibleDigimon}
                      onDigimonClick={onDigimonClick}
                      darkMode={darkMode}
                    />
                  )}
                  <DnaRequirementsBox formattedReqs={formattedDnaReqs} darkMode={darkMode} />
                </div>
              </div>
            ) : (
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
