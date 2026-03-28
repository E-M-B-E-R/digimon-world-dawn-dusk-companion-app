import { useState } from 'react';
import { Digimon, Evolution } from '../../types/digimon';
import { getEvolutionsFrom } from '../../data/digimon-data';
import { Sun, Moon } from 'lucide-react';
import { useEvolutionTree } from '../../hooks/useEvolutionTree';
import { useNodePositioning } from '../../hooks/useNodePositioning';
import { useEvolutionConnections } from '../../hooks/useEvolutionConnections';
import { isArmorDigimon } from '../../constants/armorDigimon';

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

const DEFAULT_LINE_COLOR = '#C084FC';
const ARMOR_COLOR = '#facc15';

const calculateBoxDimensions = (text: string) => {
  const charWidth = 6.5;
  const padding = 20;
  const lineHeight = 14;
  const verticalPadding = 12;
  const minWidth = 100;
  const maxWidth = 200;

  if (text.includes('\n')) {
    const parts = text.split('\n').map(p => p.trim());
    const maxLineLength = Math.max(...parts.map(p => p.length));
    const multilineWidth = Math.min(maxWidth, Math.max(minWidth, maxLineLength * charWidth + padding));
    return { width: multilineWidth, height: lineHeight * parts.length + verticalPadding, lines: parts, multiline: true };
  }

  const estimatedWidth = Math.min(maxWidth, Math.max(minWidth, text.length * charWidth + padding));
  return { width: estimatedWidth, height: lineHeight + verticalPadding, lines: [text], multiline: false };
};

export function EvolutionTreeGraph({
  rootDigimonId,
  evolutions,
  onDigimonClick,
  darkMode,
  lineColor,
  digimonName,
  isMobile,
}: EvolutionTreeGraphProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { visited, nodesByStage, hiddenNodes } = useEvolutionTree(rootDigimonId, collapsed);
  const nodes = useNodePositioning(visited, nodesByStage, hiddenNodes);
  const { connections } = useEvolutionConnections(nodes, evolutions, hiddenNodes, lineColor, collapsed);

  const maxX = Math.max(...nodes.map(n => n.x), 0) + 200;
  const maxY = Math.max(...nodes.map(n => n.y), 0) + 250;
  const firstNode = nodes.find(n => n.column === 0 && n.row === 0);

  const getNodePosition = (id: string) => nodes.find(n => n.id === id);

  return (
    <div
      className={`relative w-full overflow-auto rounded-lg p-8 ${
        darkMode ? 'bg-[#3e3d32]' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}
      style={{ minHeight: '600px' }}
    >
      {digimonName && firstNode && (
        <h2
          className={`absolute text-2xl ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-800'}`}
          style={{ left: firstNode.x, top: firstNode.y - 40 }}
        >
          {digimonName}
        </h2>
      )}

      <div className="relative" style={{ width: maxX, height: maxY }}>
        <svg className="absolute inset-0 pointer-events-none" style={{ width: maxX, height: maxY }}>
          {/* First pass: render paths under requirement boxes */}
          {connections.map((conn, index) => {
            const fromNode = getNodePosition(conn.from);
            const toNode = getNodePosition(conn.to);
            if (!fromNode || !toNode) return null;

            const fromX = fromNode.x + 160;
            const fromY = fromNode.y + 100 + conn.fromOffset;
            const toX = toNode.x;
            const toY = toNode.y + 100 + conn.toOffset;
            const horizontalDistance = toX - fromX;
            const controlX1 = fromX + horizontalDistance * 0.25;
            const controlX2 = toX - horizontalDistance * 0.25;
            const path = `M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX} ${toY}`;

            return (
              <path
                key={`path-${conn.from}-${conn.to}-${index}`}
                d={path}
                stroke={conn.color}
                strokeWidth="3"
                strokeDasharray={conn.dash}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Second pass: render requirement boxes on top */}
          {connections.map((conn, index) => {
            const fromNode = getNodePosition(conn.from);
            const toNode = getNodePosition(conn.to);
            if (!fromNode || !toNode || !conn.requirements) return null;

            const fromX = fromNode.x + 160;
            const fromY = fromNode.y + 100 + conn.fromOffset;
            const toX = toNode.x;
            const toY = toNode.y + 100 + conn.toOffset;
            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2;

            const box = calculateBoxDimensions(conn.requirements);
            const reqX = midX - box.width / 2;
            const reqY = midY - box.height / 2;
            const lineHeight = 14;

            return (
              <g key={`box-${conn.from}-${conn.to}-${index}`}>
                <rect
                  x={reqX}
                  y={reqY}
                  width={box.width}
                  height={box.height}
                  fill={darkMode ? '#49483e' : 'white'}
                  stroke={conn.color}
                  strokeWidth="2"
                  rx="4"
                />
                {box.multiline ? (
                  box.lines.map((line, lineIndex) => {
                    const totalLines = box.lines.length;
                    const startY = reqY + box.height / 2 - ((totalLines - 1) * lineHeight) / 2;
                    return (
                      <text
                        key={lineIndex}
                        x={midX}
                        y={startY + lineIndex * lineHeight + 4}
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
                    y={reqY + box.height / 2 + 4}
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
          })}
        </svg>

        {nodes.map(node => {
          const isArmor = isArmorDigimon(node.id);
          const border = isArmor ? ARMOR_COLOR : (lineColor || DEFAULT_LINE_COLOR);

          return (
            <div
              key={node.id}
              data-testid="digimon-node"
              className={`relative cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:z-10 rounded-xl shadow-lg border-4 overflow-visible ${
                darkMode ? 'bg-[#49483e]' : 'bg-white'
              }`}
              style={{ position: 'absolute', left: node.x, top: node.y, width: '160px', height: '200px', borderColor: border }}
              onClick={() => onDigimonClick(node.id)}
            >
              {!isMobile && getEvolutionsFrom(node.id).length > 0 && (
                <div className="absolute top-2 right-2 z-20 pointer-events-auto">
                  <button
                    aria-label={collapsed.has(node.id) ? 'Expand evolutions' : 'Collapse evolutions'}
                    onClick={e => { e.stopPropagation(); toggleCollapse(node.id); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-xl font-bold shadow-md leading-none"
                    style={{
                      lineHeight: '1',
                      backgroundColor: collapsed.has(node.id) ? '#86efac' : '#fca5a5',
                      color: '#000000',
                    }}
                  >
                    <span>{collapsed.has(node.id) ? '+' : '-'}</span>
                  </button>
                </div>
              )}
              <div className="p-3 h-full flex flex-col">
                <div
                  className={`w-full h-32 mb-2 rounded-lg overflow-hidden flex items-center justify-center ${
                    darkMode ? 'bg-[#75715e]' : 'bg-gray-100'
                  }`}
                >
                  <img
                    src={node.digimon.image}
                    alt=""
                    className="mx-auto block"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </div>
                <div className="text-center flex-1 flex flex-col justify-end">
                  <div
                    className={`text-sm px-1 flex items-center justify-center gap-1 ${
                      darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'
                    }`}
                  >
                    {node.digimon.exclusive && (
                      node.digimon.exclusive === 'Dawn' ? (
                        <Sun className="text-yellow-400 drop-shadow-lg flex-shrink-0" fill="currentColor" style={{ width: '16px', height: '16px' }} />
                      ) : (
                        <Moon className="text-blue-300 drop-shadow-lg flex-shrink-0" fill="currentColor" style={{ width: '16px', height: '16px' }} />
                      )
                    )}
                    <span className="truncate">{node.digimon.name}</span>
                  </div>
                  <div className={`text-xs mt-1 ${darkMode ? 'text-[#75715e]' : 'text-gray-600'}`}>
                    {node.digimon.stage}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
