import { Digimon, Evolution, EvolutionTree, DigimonStage } from '../types/digimon';
import rawDigimonData from '../evolution_data/digimon.json';
import rawEvoLines from '../evolution_data/evo_lines.json';

// Use Vite's glob import to get all available gifs
const gifModules = import.meta.glob('/src/images/animated/**/*.gif', { eager: true, as: 'url' });

// Build a lookup map: normalize(filename) -> full path
const gifLookup = new Map<string, string>();
for (const [path, url] of Object.entries(gifModules)) {
  const filename = path.split('/').pop()?.replace('.gif', '').replace(/\s+/g, '') || '';
  const normalized = filename.toLowerCase().replace(/[\s\-']/g, '');
  gifLookup.set(normalized, url as string);
  // Also store the original filename
  gifLookup.set(filename.toLowerCase(), url as string);
  gifLookup.set(filename, url as string);
  // Store without vowels for fuzzy matching (handles Galgomon vs Galgoumon)
  const noVowels = filename.toLowerCase().replace(/[aeiou]/gi, '');
  if (!gifLookup.has(noVowels)) {
    gifLookup.set(noVowels, url as string);
  }
}

// Collect all possible name variations without preferring any
function collectNameVariants(d: any): string[] {
  const variants = new Set<string>();
  
  // Add all name fields as-is and with common normalizations
  const nameFields = [
    ...(Array.isArray(d.gifName) ? d.gifName : []),
    ...(Array.isArray(d.altNames) ? d.altNames : []),
    d.fullName,
    d.shortName
  ].filter(Boolean);
  
  for (const name of nameFields) {
    if (typeof name === 'string' && name.trim()) {
      variants.add(name);
      variants.add(name.replace(/\s+/g, ''));
      variants.add(name.replace(/[\s\-']/g, ''));
    }
  }
  
  return Array.from(variants);
}

function stageFolder(stage: DigimonStage): string | null {
  const map: Record<DigimonStage, string> = {
    'In-Training': 'in-training',
    'Rookie': 'rookie',
    'Champion': 'champion',
    'Ultimate': 'ultimate',
    'Mega': 'mega'
  };
  return map[stage] ?? null;
}

// Transform raw JSON data into app format
function transformDigimonData(): Digimon[] {
  return (rawDigimonData as any[]).map(d => {
    const name = d.fullName || d.altNames?.[0] || '';
    const id = name.toLowerCase().replace(/\s+/g, '');
    if (!d.stage) {
      console.warn(`Digimon "${name}" missing stage property`);
    }
    const stage: DigimonStage = d.stage || 'Rookie';

    // Determine the folder based on stage
    const folder = stageFolder(stage);

    let imagePath: string;
    if (folder) {
      // Get all name variants and check which one exists in our gif lookup
      const candidates = collectNameVariants(d);
      let foundGif: string | undefined;
      
      for (const candidate of candidates) {
        const normalized = candidate.toLowerCase().replace(/[\s\-']/g, '');
        if (gifLookup.has(normalized)) {
          foundGif = gifLookup.get(normalized);
          break;
        }
        if (gifLookup.has(candidate.toLowerCase())) {
          foundGif = gifLookup.get(candidate.toLowerCase());
          break;
        }
        if (gifLookup.has(candidate)) {
          foundGif = gifLookup.get(candidate);
          break;
        }
      }
      
      // Fallback: try fuzzy matching without vowels
      if (!foundGif) {
        for (const candidate of candidates) {
          const noVowels = candidate.toLowerCase().replace(/[aeiou]/gi, '');
          if (gifLookup.has(noVowels)) {
            foundGif = gifLookup.get(noVowels);
            break;
          }
        }
      }
      
      imagePath = foundGif || `https://via.placeholder.com/200?text=${encodeURIComponent(name || '')}`;
    } else {
      imagePath = `https://via.placeholder.com/200?text=${encodeURIComponent(name || '')}`;
    }
    
    return {
      id,
      name,
      stage,
      image: imagePath,
      type: [],
      description: `${name} - Habitat: ${d.habitat || 'Unknown'}`
    };
  });
}

function formatEvoRequirements(evoReqs: Record<string, any> | undefined): string | undefined {
  if (!evoReqs || Object.keys(evoReqs).length === 0) return undefined;
  
  const requirements: string[] = [];
  
  Object.entries(evoReqs).forEach(([key, value]) => {
    const valueStr = String(value);
    const containsBefriend = valueStr.toLowerCase().includes('befriend');
    const shouldAddPlus = typeof value === 'number' && !containsBefriend;
    const suffix = shouldAddPlus ? '+' : '';

    if (key === 'level') {
      requirements.push(`Level ${value}${suffix}`);
    } else if (key.endsWith('Exp')) {
      // e.g., dragonExp -> Dragon EXP
      const formatted = key.replace(/Exp$/, '').replace(/([A-Z])/g, ' $1').trim();
      const capitalized = formatted
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      requirements.push(`${capitalized} EXP ${value}${suffix}`);
    } else if (key === 'friendship') {
      requirements.push(`Friendship ${value}${suffix}`);
    } else if (key === 'attack') {
      requirements.push(`Attack ${value}${suffix}`);
    } else if (key === 'defense') {
      requirements.push(`Defense ${value}${suffix}`);
    } else if (key === 'speed') {
      requirements.push(`Speed ${value}${suffix}`);
    } else if (key === 'spirit') {
      requirements.push(`Spirit ${value}${suffix}`);
    } else {
      // Generic format
      requirements.push(`${key} ${value}${suffix}`);
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
