import { useEffect, useState } from 'react';
import { Digimon, Evolution, DigimonStage } from '../types/digimon';
import { getDigimonById, getEvolutionsFrom, getEvolutionsTo } from '../data/digimon-data';

interface EvolutionTreeGraphProps {
  rootDigimonId: string;
  digimonData: Digimon[];
  evolutions: Evolution[];
  onDigimonClick: (id: string) => void;
  darkMode?: boolean;
  lineColor?: string;
  digimonName?: string;
  isMobile?: boolean;
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
  'In-Training': 0,
  'Rookie': 1,
  'Champion': 2,
  'Ultimate': 3,
  'Mega': 4
};

const STAGE_COLORS: Record<DigimonStage, string> = {
  'In-Training': 'border-purple-400',
  'Rookie': 'border-purple-400',
  'Champion': 'border-purple-400',
  'Ultimate': 'border-purple-400',
  'Mega': 'border-purple-400'
};

const DEFAULT_LINE_COLOR = '#C084FC'; // Light purple color for all lines

export function EvolutionTreeGraph({ 
  rootDigimonId, 
  digimonData, 
  evolutions,
  onDigimonClick,
  darkMode,
  lineColor,
  digimonName
  , isMobile
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
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [collapsedChildrenCounts, setCollapsedChildrenCounts] = useState<Record<string, number>>({});

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandChildrenOf = (parentId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      // remove any collapsed child whose parent is parentId
      evolutions.forEach(evo => {
        if (evo.from === parentId && next.has(evo.to)) {
          next.delete(evo.to);
        }
      });
      return next;
    });
  };

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

    // Compute set of hidden nodes (descendants of collapsed nodes, not the nodes themselves)
    const hiddenNodes = new Set<string>();
    const computeDescendants = (id: string) => {
      // Mark descendants as hidden (but not the node itself)
      getEvolutionsFrom(id).forEach(evo => {
        if (hiddenNodes.has(evo.to)) return;
        hiddenNodes.add(evo.to);
        computeDescendants(evo.to);
      });
    };
    collapsed.forEach(id => computeDescendants(id));
    
    // Position nodes using a hierarchical layout algorithm to minimize line crossings
    const positionedNodes: PositionedNode[] = [];
    const cardWidth = 160;
    const cardHeight = 200;
    const horizontalGap = 240;
    const verticalGap = 280;
    
    const positionMap = new Map<string, { x: number; y: number }>();
    const stages = Array.from(nodesByStage.keys()).sort((a, b) => a - b);
    
    // First pass: assign each node to a grid position based on stage and parent relationships
    const nodeToGridRow = new Map<string, number>();
    
    stages.forEach((stageLevel, columnIndex) => {
      const digimonIds = Array.from(nodesByStage.get(stageLevel) || []).filter(id => !hiddenNodes.has(id));
      
      // Sort by parent position to keep siblings together and reduce crossings
      const sortedIds = digimonIds.sort((a, b) => {
        const parentsA = getEvolutionsTo(a).map(e => e.from);
        const parentsB = getEvolutionsTo(b).map(e => e.from);
        
        if (parentsA.length > 0 && parentsB.length > 0) {
          const posA = nodeToGridRow.get(parentsA[0]) ?? 0;
          const posB = nodeToGridRow.get(parentsB[0]) ?? 0;
          return posA - posB;
        }
        
        return 0;
      });
      
      sortedIds.forEach((id, rowIndex) => {
        nodeToGridRow.set(id, rowIndex);
      });
    });
    
    // Second pass: calculate actual positions
    stages.forEach((stageLevel, columnIndex) => {
      const digimonIds = Array.from(nodesByStage.get(stageLevel) || []).filter(id => !hiddenNodes.has(id));
      const x = columnIndex * (cardWidth + horizontalGap);
      
      // Sort by parent relationship
      const sortedIds = digimonIds.sort((a, b) => {
        const rowA = nodeToGridRow.get(a) ?? 0;
        const rowB = nodeToGridRow.get(b) ?? 0;
        return rowA - rowB;
      });
      
      sortedIds.forEach((id) => {
        const predecessors = getEvolutionsTo(id).map(e => e.from);
        const predecessorPositions = predecessors
          .map(p => positionMap.get(p))
          .filter(Boolean) as Array<{ x: number; y: number }>;
        
        let baseY = 0;
        
        if (predecessorPositions.length > 0) {
          // Position relative to parent, accounting for all siblings
          const parentY = predecessorPositions[0].y;
          const parent = getEvolutionsTo(id)[0];
          
          if (parent) {
            const allChildren = getEvolutionsFrom(parent.from)
              .map(e => e.to)
              .filter(childId => !hiddenNodes.has(childId));
            
            const childIndex = allChildren.indexOf(id);
            const childCount = allChildren.length;
            
            // Spread children evenly around parent
            const verticalSpacing = verticalGap * 0.9;
            const totalSpread = (childCount - 1) * verticalSpacing / 2;
            baseY = parentY + (childIndex * verticalSpacing) - totalSpread;
          }
        }
        
        const gridRow = nodeToGridRow.get(id) ?? 0;
        baseY = Math.max(baseY, gridRow * verticalGap);
        
        positionMap.set(id, { x, y: baseY });
        
        const digimon = getDigimonById(id);
        if (digimon) {
          positionedNodes.push({
            id,
            digimon,
            x,
            y: baseY,
            column: columnIndex,
            row: gridRow
          });
        }
      });
    });
    
    // Normalize positions so min Y is at least 0 with padding
    const allYPositions = positionedNodes.map(n => n.y);
    const minY = Math.min(...allYPositions, 0);
    const yOffset = Math.max(0, -minY + 40); // 40px top padding
    
    // Apply offset to all nodes
    positionedNodes.forEach(node => {
      node.y += yOffset;
    });
    
    // Update position map with offsets
    positionMap.forEach((pos, id) => {
      pos.y += yOffset;
    });
    
    setNodes(positionedNodes);
    
    // Build connections with improved routing to minimize overlaps
    const conns: Array<{ from: string; to: string; requirements?: string; color: string; fromOffset: number; toOffset: number }> = [];
    
    // Count connections from each node
    const fromConnectionCounts = new Map<string, number>();
    const toConnectionCounts = new Map<string, number>();
    
    evolutions.forEach(evo => {
      if (hiddenNodes.has(evo.from) || hiddenNodes.has(evo.to)) return;
      const fromNode = positionedNodes.find(n => n.id === evo.from);
      const toNode = positionedNodes.find(n => n.id === evo.to);
      if (fromNode && toNode) {
        fromConnectionCounts.set(evo.from, (fromConnectionCounts.get(evo.from) || 0) + 1);
        toConnectionCounts.set(evo.to, (toConnectionCounts.get(evo.to) || 0) + 1);
      }
    });

    // Count collapsed children per parent
    const collapsedCounts: Record<string, number> = {};
    evolutions.forEach(evo => {
      if (collapsed.has(evo.to) && !collapsed.has(evo.from)) {
        collapsedCounts[evo.from] = (collapsedCounts[evo.from] || 0) + 1;
      }
    });
    setCollapsedChildrenCounts(collapsedCounts);
    
    const fromConnectionIndex = new Map<string, number>();
    const toConnectionIndex = new Map<string, number>();
    
    evolutions.forEach(evo => {
      if (hiddenNodes.has(evo.from) || hiddenNodes.has(evo.to)) return;
      const fromNode = positionedNodes.find(n => n.id === evo.from);
      const toNode = positionedNodes.find(n => n.id === evo.to);

      if (fromNode && toNode) {
        const fromCount = fromConnectionCounts.get(evo.from) || 1;
        const toCount = toConnectionCounts.get(evo.to) || 1;

        const fromIdx = fromConnectionIndex.get(evo.from) || 0;
        const toIdx = toConnectionIndex.get(evo.to) || 0;

        fromConnectionIndex.set(evo.from, fromIdx + 1);
        toConnectionIndex.set(evo.to, toIdx + 1);

        // Calculate offsets with better spacing to avoid line crossings
        const cardHeight = 200;
        const fromOffset = fromCount > 1 ? (fromIdx / (fromCount - 1) - 0.5) * (cardHeight * 0.6) : 0;
        const toOffset = toCount > 1 ? (toIdx / (toCount - 1) - 0.5) * (cardHeight * 0.6) : 0;

        conns.push({
          from: evo.from,
          to: evo.to,
          requirements: evo.requirements,
          color: lineColor || DEFAULT_LINE_COLOR,
          fromOffset,
          toOffset
        });
      }
    });
    
    setConnections(conns);
  }, [rootDigimonId, digimonData, evolutions, lineColor, collapsed]);

  const getNodePosition = (id: string) => {
    return nodes.find(n => n.id === id);
  };

  // Calculate SVG dimensions
  const maxX = Math.max(...nodes.map(n => n.x), 0) + 200;
  const maxY = Math.max(...nodes.map(n => n.y), 0) + 250;

  // Find the first node (top-left, column 0, row 0)
  const firstNode = nodes.find(n => n.column === 0 && n.row === 0);

  // Helper function to calculate dynamic box dimensions and check for overlap
  const calculateBoxDimensions = (text: string, midX: number, reqY: number) => {
    const charWidth = 6.5; // Approximate width per character at font size 10
    const padding = 20; // Horizontal padding (10px each side)
    const lineHeight = 14; // Height per line of text
    const verticalPadding = 12; // Vertical padding
    const minWidth = 100;
    const maxWidth = 200;
    
    // If text contains comma, always split into multiple lines
    if (text.includes('\n')) {
      const parts = text.split('\n').map(p => p.trim());
      // Calculate width needed for the longest line
      const maxLineLength = Math.max(...parts.map(p => p.length));
      const multilineWidth = Math.min(maxWidth, Math.max(minWidth, maxLineLength * charWidth + padding));
      
      return {
        width: multilineWidth,
        height: lineHeight * parts.length + verticalPadding,
        lines: parts,
        multiline: true
      };
    }
    
    // Single line case
    const estimatedWidth = Math.min(maxWidth, Math.max(minWidth, text.length * charWidth + padding));
    const baseHeight = lineHeight + verticalPadding;
    
    return {
      width: estimatedWidth,
      height: baseHeight,
      lines: [text],
      multiline: false
    };
  };

  return (
    <div 
      className={`relative w-full overflow-auto rounded-lg p-8 ${
        darkMode 
          ? 'bg-[#3e3d32]' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}
      style={{ minHeight: '600px' }}
    >
      {/* Digimon Name - positioned above first node */}
      {digimonName && firstNode && (
        <h2 
          className={`absolute text-2xl ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-800'}`}
          style={{
            left: firstNode.x,
            top: firstNode.y - 40
          }}
        >
          {digimonName}
        </h2>
      )}
      
      <div className="relative" style={{ width: maxX, height: maxY }}>
        {/* SVG for connections */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{ width: maxX, height: maxY }}
        >
          {
            // First pass: render all paths so they sit underneath requirement boxes
            connections.map((conn, index) => {
              const fromNode = getNodePosition(conn.from);
              const toNode = getNodePosition(conn.to);
              if (!fromNode || !toNode) return null;

              const fromX = fromNode.x + 160; // Card width
              const fromY = fromNode.y + 100 + conn.fromOffset; // Half card height
              const toX = toNode.x;
              const toY = toNode.y + 100 + conn.toOffset;

              // Calculate midpoint with offset based on relative positions
              const horizontalDistance = toX - fromX;
              
              // Use curved path with better spacing to avoid line crossings
              const curveDistance = horizontalDistance * 0.35;
              
              // Create a smoother curve that respects connection offsets
              const controlX1 = fromX + (horizontalDistance * 0.25);
              const controlX2 = toX - (horizontalDistance * 0.25);
              const path = `M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX} ${toY}`;

              return (
                <path
                  key={`path-${conn.from}-${conn.to}-${index}`}
                  d={path}
                  stroke={conn.color}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })
          }

          {
            // Second pass: render requirement boxes and text on top of paths
            connections.map((conn, index) => {
              const fromNode = getNodePosition(conn.from);
              const toNode = getNodePosition(conn.to);
              if (!fromNode || !toNode || !conn.requirements) return null;

              const fromX = fromNode.x + 160;
              const fromY = fromNode.y + 100 + conn.fromOffset;
              const toX = toNode.x;
              const toY = toNode.y + 100 + conn.toOffset;

              // Calculate midpoint for requirement box (use midpoint of curve)
              const midX = (fromX + toX) / 2;
              const midY = (fromY + toY) / 2;
              
              const boxDimensions = calculateBoxDimensions(conn.requirements || '', midX, midY);
              const reqX = midX - (boxDimensions.width / 2);
              const reqY = midY - (boxDimensions.height / 2);
              const lineHeight = 14;

              return (
                <g key={`box-${conn.from}-${conn.to}-${index}`}>
                  <rect
                    x={reqX}
                    y={reqY}
                    width={boxDimensions.width}
                    height={boxDimensions.height}
                    fill={darkMode ? '#49483e' : 'white'}
                    stroke={conn.color}
                    strokeWidth="2"
                    rx="4"
                  />
                  {boxDimensions.multiline ? (
                    boxDimensions.lines.map((line, lineIndex) => {
                      const totalLines = boxDimensions.lines.length;
                      const startY = reqY + (boxDimensions.height / 2) - ((totalLines - 1) * lineHeight / 2);
                      return (
                        <text
                          key={lineIndex}
                          x={midX}
                          y={startY + (lineIndex * lineHeight) + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fill={darkMode ? '#f8f8f2' : '#374151'}
                          fontFamily="system-ui"
                        >
                          {line}
                        </text>
                      );
                    })
                  ) : (
                    <text
                      x={midX}
                      y={reqY + (boxDimensions.height / 2) + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill={darkMode ? '#f8f8f2' : '#374151'}
                      fontFamily="system-ui"
                    >
                      {conn.requirements}
                    </text>
                  )}
                </g>
              );
            })
          }
        </svg>
        
        {/* Digimon cards */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`relative cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:z-10 rounded-xl shadow-lg border-4 overflow-visible ${
              darkMode ? 'bg-[#49483e]' : 'bg-white'
            }`}
            style={{
              position: 'absolute',
              left: node.x,
              top: node.y,
              width: '160px',
              height: '200px',
              borderColor: lineColor || DEFAULT_LINE_COLOR
            }}
            onClick={() => onDigimonClick(node.id)}
          >
            {!isMobile && getEvolutionsFrom(node.id).length > 0 && (
              <div className="absolute top-2 right-2 z-50 pointer-events-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold shadow-md leading-none"
                  style={{ 
                    lineHeight: '1',
                    backgroundColor: collapsed.has(node.id) ? '#86efac' : '#fca5a5',
                    color: '#000000'
                  }}
                >
                  <span>{collapsed.has(node.id) ? '+' : '-'}</span>
                </button>
              </div>
            )}
            <div className="p-3 h-full flex flex-col">
              <div className={`w-full h-32 mb-2 rounded-lg overflow-hidden flex items-center justify-center ${
                darkMode ? 'bg-[#75715e]' : 'bg-gray-100'
              }`}>
                <img src={node.digimon.image} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-center flex-1 flex flex-col justify-end">
                <div className={`text-sm truncate px-1 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>
                  {node.digimon.name}
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-[#75715e]' : 'text-gray-600'}`}>
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