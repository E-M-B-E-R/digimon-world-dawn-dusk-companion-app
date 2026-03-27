import { useMemo } from 'react';
import { Digimon, DigimonStage, Evolution } from '../types/digimon';

const stageOrder: DigimonStage[] = ['In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega'];

export function useVerticalEvolutionTree(
  rootDigimonId: string,
  evolutions: Evolution[],
  digimonData: Digimon[]
) {
  const treeDigimonIds = useMemo(() => {
    const tree = new Set<string>([rootDigimonId]);

    // Descendants (forward evolutions)
    const forwardQueue = [rootDigimonId];
    while (forwardQueue.length > 0) {
      const current = forwardQueue.shift()!;
      evolutions.filter(e => e.from === current).forEach(evo => {
        if (!tree.has(evo.to)) {
          tree.add(evo.to);
          forwardQueue.push(evo.to);
        }
      });
    }

    // Ancestors and their siblings
    const ancestorQueue = [rootDigimonId];
    while (ancestorQueue.length > 0) {
      const current = ancestorQueue.shift()!;
      evolutions.filter(e => e.to === current).forEach(evo => {
        if (!tree.has(evo.from)) {
          tree.add(evo.from);
          ancestorQueue.push(evo.from);

          // Add siblings (other evolutions from the same parent)
          const siblingsQueue = [evo.from];
          while (siblingsQueue.length > 0) {
            const parent = siblingsQueue.shift()!;
            evolutions.filter(e => e.from === parent).forEach(siblingEvo => {
              if (!tree.has(siblingEvo.to)) {
                tree.add(siblingEvo.to);
                siblingsQueue.push(siblingEvo.to);
              }
            });
          }
        }
      });
    }

    return Array.from(tree);
  }, [rootDigimonId, evolutions]);

  const treeDigimon = useMemo(
    () => digimonData.filter(d => treeDigimonIds.includes(d.id)),
    [digimonData, treeDigimonIds]
  );

  const digimonByStage = useMemo(
    () =>
      stageOrder.reduce((acc, stage) => {
        acc[stage] = treeDigimon.filter(d => d.stage === stage);
        return acc;
      }, {} as Record<DigimonStage, Digimon[]>),
    [treeDigimon]
  );

  const treeEvolutions = useMemo(
    () => evolutions.filter(e => treeDigimonIds.includes(e.from) && treeDigimonIds.includes(e.to)),
    [evolutions, treeDigimonIds]
  );

  return { treeDigimonIds, treeDigimon, digimonByStage, treeEvolutions };
}
