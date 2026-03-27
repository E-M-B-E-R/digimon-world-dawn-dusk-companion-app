import { useMemo } from 'react';
import { Evolution } from '../types/digimon';
import { ARMOR_DIGIMON_IDS } from '../constants/armorDigimon';
import { PositionedNode } from './useNodePositioning';

const DEFAULT_LINE_COLOR = '#C084FC';
const ARMOR_COLOR = '#facc15';
const CARD_HEIGHT = 200;

export interface Connection {
  from: string;
  to: string;
  requirements?: string;
  color: string;
  fromOffset: number;
  toOffset: number;
  isArmor?: boolean;
  dash?: string;
}

export function useEvolutionConnections(
  nodes: PositionedNode[],
  evolutions: Evolution[],
  hiddenNodes: Set<string>,
  lineColor?: string,
  collapsed?: Set<string>
): { connections: Connection[]; collapsedChildrenCounts: Record<string, number> } {
  return useMemo(() => {
    const fromConnectionCounts = new Map<string, number>();
    const toConnectionCounts = new Map<string, number>();

    evolutions.forEach(evo => {
      if (hiddenNodes.has(evo.from) || hiddenNodes.has(evo.to)) return;
      const fromNode = nodes.find(n => n.id === evo.from);
      const toNode = nodes.find(n => n.id === evo.to);
      if (fromNode && toNode) {
        fromConnectionCounts.set(evo.from, (fromConnectionCounts.get(evo.from) || 0) + 1);
        toConnectionCounts.set(evo.to, (toConnectionCounts.get(evo.to) || 0) + 1);
      }
    });

    // Count collapsed children per parent
    const collapsedChildrenCounts: Record<string, number> = {};
    if (collapsed) {
      evolutions.forEach(evo => {
        if (collapsed.has(evo.to) && !collapsed.has(evo.from)) {
          collapsedChildrenCounts[evo.from] = (collapsedChildrenCounts[evo.from] || 0) + 1;
        }
      });
    }

    const fromConnectionIndex = new Map<string, number>();
    const toConnectionIndex = new Map<string, number>();
    const connections: Connection[] = [];

    evolutions.forEach(evo => {
      if (hiddenNodes.has(evo.from) || hiddenNodes.has(evo.to)) return;
      const fromNode = nodes.find(n => n.id === evo.from);
      const toNode = nodes.find(n => n.id === evo.to);

      if (fromNode && toNode) {
        const fromCount = fromConnectionCounts.get(evo.from) || 1;
        const toCount = toConnectionCounts.get(evo.to) || 1;
        const fromIdx = fromConnectionIndex.get(evo.from) || 0;
        const toIdx = toConnectionIndex.get(evo.to) || 0;

        fromConnectionIndex.set(evo.from, fromIdx + 1);
        toConnectionIndex.set(evo.to, toIdx + 1);

        const fromOffset = fromCount > 1 ? ((fromIdx / (fromCount - 1)) - 0.5) * (CARD_HEIGHT * 0.6) : 0;
        const toOffset = toCount > 1 ? ((toIdx / (toCount - 1)) - 0.5) * (CARD_HEIGHT * 0.6) : 0;

        const isArmor = ARMOR_DIGIMON_IDS.has(evo.to);

        connections.push({
          from: evo.from,
          to: evo.to,
          requirements: evo.requirements,
          color: isArmor ? ARMOR_COLOR : (lineColor || DEFAULT_LINE_COLOR),
          fromOffset,
          toOffset,
          isArmor,
          dash: isArmor ? '6 6' : undefined,
        });
      }
    });

    return { connections, collapsedChildrenCounts };
  }, [nodes, evolutions, hiddenNodes, lineColor, collapsed]);
}
