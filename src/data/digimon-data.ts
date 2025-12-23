import { Digimon, Evolution, EvolutionTree } from '../types/digimon';
import rawDigimonData from '../evolution_data/digimon.json';
import rawEvoLines from '../evolution_data/evo_lines.json';

// Transform raw JSON data into app format
function transformDigimonData(): Digimon[] {
  return (rawDigimonData as any[]).map(d => ({
    id: (d.fullName || d.altNames?.[0] || '').toLowerCase().replace(/\s+/g, ''),
    name: d.fullName || d.altNames?.[0] || '',
    stage: d.stage || 'Rookie',
    image: `https://via.placeholder.com/200?text=${encodeURIComponent(d.fullName || '')}`,
    type: [],
    description: `${d.fullName || ''} - Habitat: ${d.habitat || 'Unknown'}`
  }));
}

function formatEvoRequirements(evoReqs: Record<string, any> | undefined): string | undefined {
  if (!evoReqs || Object.keys(evoReqs).length === 0) return undefined;
  
  const requirements: string[] = [];
  
  Object.entries(evoReqs).forEach(([key, value]) => {
    if (key === 'level') {
      requirements.push(`Level ${value}+`);
    } else if (key.endsWith('Exp')) {
      // e.g., dragonExp -> Dragon EXP
      const formatted = key.replace(/Exp$/, '').replace(/([A-Z])/g, ' $1').trim();
      const capitalized = formatted
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      requirements.push(`${capitalized} EXP ${value}+`);
    } else if (key === 'friendship') {
      requirements.push(`Friendship ${value}+`);
    } else if (key === 'attack') {
      requirements.push(`Attack ${value}+`);
    } else if (key === 'defense') {
      requirements.push(`Defense ${value}+`);
    } else if (key === 'speed') {
      requirements.push(`Speed ${value}+`);
    } else if (key === 'spirit') {
      requirements.push(`Spirit ${value}+`);
    } else {
      // Generic format
      requirements.push(`${key} ${value}+`);
    }
  });
  
  return requirements.length > 0 ? requirements.join(',\n') : undefined;
}

function transformEvoLines(): Evolution[] {
  const evolutions: Evolution[] = [];
  
  // Build a map of digimon name -> evoReqs for quick lookup
  const evoReqsMap = new Map<string, Record<string, any>>();
  (rawDigimonData as any[]).forEach(d => {
    const id = (d.fullName || d.altNames?.[0] || '').toLowerCase().replace(/\s+/g, '');
    if (d.evoReqs) {
      evoReqsMap.set(id, d.evoReqs);
    }
  });
  
  Object.entries(rawEvoLines as Record<string, any>).forEach(([_startPoint, evolutions_obj]) => {
    Object.entries(evolutions_obj as Record<string, string[]>).forEach(([fromName, toNames]) => {
      const fromId = fromName.toLowerCase().replace(/\s+/g, '');
      
      toNames.forEach(toName => {
        const toId = toName.toLowerCase().replace(/\s+/g, '');
        // Get evoReqs from the "to" (evolved) Digimon
        const evoReqs = evoReqsMap.get(toId);
        const requirements = formatEvoRequirements(evoReqs);
        
        evolutions.push({
          from: fromId,
          to: toId,
          requirements
        });
      });
    });
  });
  
  return evolutions;
}

export const digimonData: Digimon[] = transformDigimonData();
export const evolutions: Evolution[] = transformEvoLines();

export const evolutionTree: EvolutionTree = {
  digimon: digimonData,
  evolutions: evolutions
};

export function getDigimonById(id: string): Digimon | undefined {
  return digimonData.find(d => d.id === id);
}

export function getEvolutionsFrom(digimonId: string): Evolution[] {
  return evolutions.filter(e => e.from === digimonId);
}

export function getEvolutionsTo(digimonId: string): Evolution[] {
  return evolutions.filter(e => e.to === digimonId);
}

export function getFullEvolutionTree(startDigimonId: string): Set<string> {
  const visited = new Set<string>();
  const queue = [startDigimonId];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    
    // Add all evolutions from this digimon
    const fromEvos = getEvolutionsFrom(current);
    fromEvos.forEach(evo => {
      if (!visited.has(evo.to)) {
        queue.push(evo.to);
      }
    });
    
    // Add all evolutions to this digimon
    const toEvos = getEvolutionsTo(current);
    toEvos.forEach(evo => {
      if (!visited.has(evo.from)) {
        queue.push(evo.from);
      }
    });
  }
  
  return visited;
}
