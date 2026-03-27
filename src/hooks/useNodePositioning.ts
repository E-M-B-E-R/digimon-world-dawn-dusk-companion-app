import { useMemo } from 'react';
import { Digimon } from '../types/digimon';
import { getDigimonById, getEvolutionsFrom, getEvolutionsTo } from '../data/digimon-data';
import { ARMOR_DIGIMON_IDS } from '../constants/armorDigimon';

export interface PositionedNode {
  id: string;
  digimon: Digimon;
  x: number;
  y: number;
  column: number;
  row: number;
}

const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;
const HORIZONTAL_GAP = 240;
const VERTICAL_GAP = 280;

export function useNodePositioning(
  visited: Set<string>,
  nodesByStage: Map<number, Set<string>>,
  hiddenNodes: Set<string>
): PositionedNode[] {
  return useMemo(() => {
    const positionedNodes: PositionedNode[] = [];
    const positionMap = new Map<string, { x: number; y: number }>();
    const stages = Array.from(nodesByStage.keys()).sort((a, b) => a - b);
    const nodeToGridRow = new Map<string, number>();

    // First pass: assign grid rows based on parent relationships
    stages.forEach((stageLevel, _columnIndex) => {
      const digimonIds = Array.from(nodesByStage.get(stageLevel) || []).filter(
        id => !hiddenNodes.has(id)
      );

      const sortedIds = digimonIds.sort((a, b) => {
        const parentsA = getEvolutionsTo(a).map(e => e.from).filter(p => visited.has(p));
        const parentsB = getEvolutionsTo(b).map(e => e.from).filter(p => visited.has(p));

        if (parentsA.length > 0 && parentsB.length > 0) {
          const posA = nodeToGridRow.get(parentsA[0]) ?? 0;
          const posB = nodeToGridRow.get(parentsB[0]) ?? 0;
          if (posA !== posB) return posA - posB;

          if (parentsA[0] === parentsB[0]) {
            const childOrder = getEvolutionsFrom(parentsA[0]).map(e => e.to);
            return childOrder.indexOf(a) - childOrder.indexOf(b);
          }
        }
        return 0;
      });

      sortedIds.forEach((id, rowIndex) => {
        nodeToGridRow.set(id, rowIndex);
      });
    });

    // Second pass: calculate actual positions
    stages.forEach((stageLevel, columnIndex) => {
      const digimonIds = Array.from(nodesByStage.get(stageLevel) || []).filter(
        id => !hiddenNodes.has(id)
      );
      const x = columnIndex * (CARD_WIDTH + HORIZONTAL_GAP);

      const sortedIds = digimonIds.sort((a, b) => {
        const rowA = nodeToGridRow.get(a) ?? 0;
        const rowB = nodeToGridRow.get(b) ?? 0;
        return rowA - rowB;
      });

      sortedIds.forEach(id => {
        const positionedParentEvos = getEvolutionsTo(id).filter(e => positionMap.has(e.from));
        let baseY = 0;

        if (positionedParentEvos.length > 0) {
          const parent = positionedParentEvos[0];
          const parentY = positionMap.get(parent.from)!.y;

          const allChildren = getEvolutionsFrom(parent.from)
            .map(e => e.to)
            .filter(childId => !hiddenNodes.has(childId) && visited.has(childId));

          const normalChildren = allChildren.filter(c => !ARMOR_DIGIMON_IDS.has(c));
          const armorChildren = allChildren.filter(c => ARMOR_DIGIMON_IDS.has(c));
          const orderedChildren = [...normalChildren, ...armorChildren];
          const childIndex = orderedChildren.indexOf(id);

          const verticalSpacing = VERTICAL_GAP * 0.9;
          const totalSpread = ((orderedChildren.length - 1) * verticalSpacing) / 2;
          baseY = parentY + childIndex * verticalSpacing - totalSpread;
        }

        const gridRow = nodeToGridRow.get(id) ?? 0;
        baseY = Math.max(baseY, gridRow * VERTICAL_GAP);

        positionMap.set(id, { x, y: baseY });

        const digimon = getDigimonById(id);
        if (digimon) {
          positionedNodes.push({ id, digimon, x, y: baseY, column: columnIndex, row: gridRow });
        }
      });
    });

    // Collision resolution: push overlapping nodes down within each column
    const minNodeGap = CARD_HEIGHT + 20;
    const nodesByColumn = new Map<number, PositionedNode[]>();
    positionedNodes.forEach(node => {
      if (!nodesByColumn.has(node.column)) nodesByColumn.set(node.column, []);
      nodesByColumn.get(node.column)!.push(node);
    });
    nodesByColumn.forEach(columnNodes => {
      columnNodes.sort((a, b) => a.y - b.y);
      for (let i = 1; i < columnNodes.length; i++) {
        const gap = columnNodes[i].y - columnNodes[i - 1].y;
        if (gap < minNodeGap) {
          const shift = minNodeGap - gap;
          for (let j = i; j < columnNodes.length; j++) {
            columnNodes[j].y += shift;
            const pos = positionMap.get(columnNodes[j].id);
            if (pos) pos.y += shift;
          }
        }
      }
    });

    // Normalize Y positions so min is 0 + padding
    const allY = positionedNodes.map(n => n.y);
    const minY = Math.min(...allY, 0);
    const yOffset = Math.max(0, -minY + 40);
    positionedNodes.forEach(node => {
      node.y += yOffset;
    });
    positionMap.forEach(pos => {
      pos.y += yOffset;
    });

    return positionedNodes;
  }, [visited, nodesByStage, hiddenNodes]);
}
