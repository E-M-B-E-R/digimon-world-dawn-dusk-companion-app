import { useMemo } from 'react';
import { DigimonStage } from '../types/digimon';
import { getDigimonById, getEvolutionsFrom, getEvolutionsTo } from '../data/digimon-data';

const STAGE_ORDER: Record<DigimonStage, number> = {
  'In-Training': 0,
  'Rookie': 1,
  'Champion': 2,
  'Ultimate': 3,
  'Mega': 4,
};

export function useEvolutionTree(rootDigimonId: string, collapsed: Set<string>) {
  return useMemo(() => {
    const visited = new Set<string>();
    const nodesByStage = new Map<number, Set<string>>();

    const findConnected = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      const digimon = getDigimonById(id);
      if (!digimon) return;
      const stageLevel = STAGE_ORDER[digimon.stage];
      if (!nodesByStage.has(stageLevel)) nodesByStage.set(stageLevel, new Set());
      nodesByStage.get(stageLevel)!.add(id);
      getEvolutionsFrom(id).forEach(evo => findConnected(evo.to));
      getEvolutionsTo(id).forEach(evo => findConnected(evo.from));
    };

    findConnected(rootDigimonId);

    // Compute hidden nodes (descendants of collapsed nodes)
    const hiddenNodes = new Set<string>();
    const computeDescendants = (id: string) => {
      getEvolutionsFrom(id).forEach(evo => {
        if (hiddenNodes.has(evo.to)) return;
        hiddenNodes.add(evo.to);
        computeDescendants(evo.to);
      });
    };
    collapsed.forEach(id => computeDescendants(id));

    return { visited, nodesByStage, hiddenNodes };
  }, [rootDigimonId, collapsed]);
}
