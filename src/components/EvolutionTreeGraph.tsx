import { useEffect, useState } from 'react';
import { Digimon, Evolution, DigimonStage } from '../types/digimon';
import { getDigimonById, getEvolutionsFrom, getEvolutionsTo } from '../data/digimon-data';

interface EvolutionTreeGraphProps {
  rootDigimonId: string;
  digimonData: Digimon[];
  evolutions: Evolution[];
  onDigimonClick: (id: string) => void;
}

interface PositionedNode {
  id: string;
  digimon: Digimon;
  x: number;
  y: number;
  column: number;
  row: number;
}

const STAGE_ORDER: Record<DigimonStage, number> = {
  'Fresh': 0,
  'In-Training': 1,
  'Rookie': 2,
  'Champion': 3,
  'Ultimate': 4,
  'Mega': 5
};

const STAGE_COLORS: Record<DigimonStage, string> = {
  'Fresh': 'border-purple-400',
  'In-Training': 'border-purple-400',
  'Rookie': 'border-purple-400',
  'Champion': 'border-purple-400',
  'Ultimate': 'border-purple-400',
  'Mega': 'border-purple-400'
};

const LINE_COLOR = '#C084FC'; // Light purple color for all lines

export function EvolutionTreeGraph({ 
  rootDigimonId, 
  digimonData, 
  evolutions,
  onDigimonClick 
}: EvolutionTreeGraphProps) {
  const [nodes, setNodes] = useState<PositionedNode[]>([]);
  const [connections, setConnections] = useState<Array<{
    from: string;
    to: string;
    requirements?: string;
    color: string;
    fromOffset: number;
    toOffset: number;
  }>>([]);

  useEffect(() => {
    // Build the tree structure
    const visited = new Set<string>();
    const nodesByStage = new Map<number, Set<string>>();
    
    const findConnected = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const digimon = getDigimonById(id);
      if (!digimon) return;
      
      const stageLevel = STAGE_ORDER[digimon.stage];
      if (!nodesByStage.has(stageLevel)) {
        nodesByStage.set(stageLevel, new Set());
      }
      nodesByStage.get(stageLevel)!.add(id);
      
      getEvolutionsFrom(id).forEach(evo => findConnected(evo.to));
      getEvolutionsTo(id).forEach(evo => findConnected(evo.from));
    };
    
    findConnected(rootDigimonId);
    
    // Position nodes
    const positionedNodes: PositionedNode[] = [];
    const cardWidth = 160;
    const cardHeight = 200;
    const horizontalGap = 200;
    const verticalGap = 40;
    
    const stages = Array.from(nodesByStage.keys()).sort((a, b) => a - b);
    
    stages.forEach((stageLevel, columnIndex) => {
      const digimonIds = Array.from(nodesByStage.get(stageLevel) || []);
      
      digimonIds.forEach((id, rowIndex) => {
        const digimon = getDigimonById(id);
        if (!digimon) return;
        
        const x = columnIndex * (cardWidth + horizontalGap);
        const y = rowIndex * (cardHeight + verticalGap);
        
        positionedNodes.push({
          id,
          digimon,
          x,
          y,
          column: columnIndex,
          row: rowIndex
        });
      });
    });
    
    setNodes(positionedNodes);
    
    // Build connections with colors
    const conns: Array<{ from: string; to: string; requirements?: string; color: string; fromOffset: number; toOffset: number }> = [];
    let colorIndex = 0;
    
    // Count connections from each node to calculate offsets
    const fromConnectionCounts = new Map<string, number>();
    const toConnectionCounts = new Map<string, number>();
    
    evolutions.forEach(evo => {
      const fromNode = positionedNodes.find(n => n.id === evo.from);
      const toNode = positionedNodes.find(n => n.id === evo.to);
      if (fromNode && toNode) {
        fromConnectionCounts.set(evo.from, (fromConnectionCounts.get(evo.from) || 0) + 1);
        toConnectionCounts.set(evo.to, (toConnectionCounts.get(evo.to) || 0) + 1);
      }
    });
    
    const fromConnectionIndex = new Map<string, number>();
    const toConnectionIndex = new Map<string, number>();
    
    evolutions.forEach(evo => {
      const fromNode = positionedNodes.find(n => n.id === evo.from);
      const toNode = positionedNodes.find(n => n.id === evo.to);
      
      if (fromNode && toNode) {
        const fromCount = fromConnectionCounts.get(evo.from) || 1;
        const toCount = toConnectionCounts.get(evo.to) || 1;
        
        const fromIdx = fromConnectionIndex.get(evo.from) || 0;
        const toIdx = toConnectionIndex.get(evo.to) || 0;
        
        fromConnectionIndex.set(evo.from, fromIdx + 1);
        toConnectionIndex.set(evo.to, toIdx + 1);
        
        // Calculate offsets based on position in the list
        const cardHeight = 200;
        const fromOffset = fromCount > 1 ? (fromIdx / (fromCount - 1) - 0.5) * (cardHeight * 0.6) : 0;
        const toOffset = toCount > 1 ? (toIdx / (toCount - 1) - 0.5) * (cardHeight * 0.6) : 0;
        
        conns.push({
          from: evo.from,
          to: evo.to,
          requirements: evo.requirements,
          color: LINE_COLOR,
          fromOffset,
          toOffset
        });
        colorIndex++;
      }
    });
    
    setConnections(conns);
  }, [rootDigimonId, digimonData, evolutions]);

  const getNodePosition = (id: string) => {
    return nodes.find(n => n.id === id);
  };

  // Calculate SVG dimensions
  const maxX = Math.max(...nodes.map(n => n.x), 0) + 200;
  const maxY = Math.max(...nodes.map(n => n.y), 0) + 250;

  return (
    <div className="relative w-full overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8" 
         style={{ minHeight: '600px' }}>
      <div className="relative" style={{ width: maxX, height: maxY }}>
        {/* SVG for connections */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{ width: maxX, height: maxY }}
        >
          {connections.map((conn, index) => {
            const fromNode = getNodePosition(conn.from);
            const toNode = getNodePosition(conn.to);
            
            if (!fromNode || !toNode) return null;
            
            const fromX = fromNode.x + 160; // Card width
            const fromY = fromNode.y + 100 + conn.fromOffset; // Half card height
            const toX = toNode.x;
            const toY = toNode.y + 100 + conn.toOffset;
            
            const midX = (fromX + toX) / 2;
            
            // Create angular path with right angles (horizontal then vertical then horizontal)
            const path = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;
            
            // Calculate position for requirement box (at the vertical segment)
            const reqX = midX - 60;
            const reqY = (fromY + toY) / 2 - 15;
            
            return (
              <g key={`${conn.from}-${conn.to}-${index}`}>
                <path
                  d={path}
                  stroke={conn.color}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="square"
                />
                
                {/* Requirement box */}
                {conn.requirements && (
                  <>
                    <rect
                      x={reqX}
                      y={reqY}
                      width="120"
                      height="30"
                      fill="white"
                      stroke={conn.color}
                      strokeWidth="2"
                      rx="4"
                    />
                    <text
                      x={midX}
                      y={reqY + 19}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#374151"
                      fontFamily="system-ui"
                    >
                      {conn.requirements}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Digimon cards */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:z-10 bg-white rounded-xl shadow-lg border-4 ${STAGE_COLORS[node.digimon.stage]}`}
            style={{
              left: node.x,
              top: node.y,
              width: '160px',
              height: '200px'
            }}
            onClick={() => onDigimonClick(node.id)}
          >
            <div className="p-3 h-full flex flex-col">
              <div className="w-full h-32 mb-2 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={node.digimon.image}
                  alt={node.digimon.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center flex-1 flex flex-col justify-end">
                <div className="text-sm text-gray-900 truncate px-1">
                  {node.digimon.name}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {node.digimon.stage}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}