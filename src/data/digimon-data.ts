import { Digimon, Evolution, EvolutionTree } from '../types/digimon';

export const digimonData: Digimon[] = [
  // In-Training
  {
    id: 'koromon',
    name: 'Koromon',
    stage: 'In-Training',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
    type: ['Dragon'],
    description: 'A Lesser Digimon whose whole body is covered in soft fur.'
  },
  {
    id: 'tsunomon',
    name: 'Tsunomon',
    stage: 'In-Training',
    image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=200&h=200&fit=crop',
    type: ['Dragon'],
    description: 'A Lesser Digimon with a timid personality and a single horn.'
  },
  {
    id: 'tokomon',
    name: 'Tokomon',
    stage: 'In-Training',
    image: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=200&h=200&fit=crop',
    type: ['Data'],
    description: 'A small Digimon that can shoot bubbles from its mouth.'
  },
  {
    id: 'bukamon',
    name: 'Bukamon',
    stage: 'In-Training',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=200&fit=crop',
    type: ['Data'],
    description: 'A tadpole-like Lesser Digimon that lives in water.'
  },
  {
    id: 'tanemon',
    name: 'Tanemon',
    stage: 'In-Training',
    image: 'https://images.unsplash.com/photo-1490718687940-0ecadf414600?w=200&h=200&fit=crop',
    type: ['Plant'],
    description: 'A Bulb Digimon that has a flower blooming on its head.'
  },
  
  // Rookie
  {
    id: 'agumon',
    name: 'Agumon',
    stage: 'Rookie',
    image: 'https://images.unsplash.com/photo-1551410224-699683e15636?w=200&h=200&fit=crop',
    type: ['Dragon', 'Vaccine'],
    description: 'A Reptile Digimon with a fearless personality despite its small size.',
    stats: { hp: 890, mp: 520, attack: 95, defense: 70, spirit: 65, speed: 75 }
  },
  {
    id: 'gabumon',
    name: 'Gabumon',
    stage: 'Rookie',
    image: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=200&h=200&fit=crop',
    type: ['Beast', 'Data'],
    description: 'A shy Reptile Digimon wearing a fur pelt from Garurumon.',
    stats: { hp: 850, mp: 580, attack: 85, defense: 75, spirit: 80, speed: 70 }
  },
  {
    id: 'patamon',
    name: 'Patamon',
    stage: 'Rookie',
    image: 'https://images.unsplash.com/photo-1455218873509-8097305e58c3?w=200&h=200&fit=crop',
    type: ['Mammal', 'Data'],
    description: 'A small flying Mammal Digimon with large ears.',
    stats: { hp: 820, mp: 620, attack: 75, defense: 65, spirit: 90, speed: 80 }
  },
  {
    id: 'gomamon',
    name: 'Gomamon',
    stage: 'Rookie',
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=200&h=200&fit=crop',
    type: ['Sea Animal', 'Vaccine'],
    description: 'A playful Sea Animal Digimon with a cheerful personality.',
    stats: { hp: 870, mp: 560, attack: 80, defense: 80, spirit: 70, speed: 75 }
  },
  {
    id: 'biyomon',
    name: 'Biyomon',
    stage: 'Rookie',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop',
    type: ['Bird', 'Vaccine'],
    description: 'A Bird Digimon with beautiful wings.',
    stats: { hp: 810, mp: 590, attack: 70, defense: 60, spirit: 85, speed: 90 }
  },
  {
    id: 'palmon',
    name: 'Palmon',
    stage: 'Rookie',
    image: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=200&h=200&fit=crop',
    type: ['Plant', 'Data'],
    description: 'A Plant Digimon with a tropical flower blooming on its head.',
    stats: { hp: 840, mp: 570, attack: 75, defense: 70, spirit: 80, speed: 65 }
  },
  
  // Champion
  {
    id: 'greymon',
    name: 'Greymon',
    stage: 'Champion',
    image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=200&h=200&fit=crop',
    type: ['Dragon', 'Vaccine'],
    description: 'A large Dinosaur Digimon with massive horns and sharp claws.',
    stats: { hp: 1520, mp: 680, attack: 145, defense: 110, spirit: 85, speed: 95 }
  },
  {
    id: 'meramon',
    name: 'Meramon',
    stage: 'Champion',
    image: 'https://images.unsplash.com/photo-1525103504173-8dc1582c7430?w=200&h=200&fit=crop',
    type: ['Flame', 'Data'],
    description: 'A Flame Digimon whose body is shrouded in fire.',
    stats: { hp: 1400, mp: 750, attack: 140, defense: 95, spirit: 115, speed: 85 }
  },
  {
    id: 'garurumon',
    name: 'Garurumon',
    stage: 'Champion',
    image: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=200&h=200&fit=crop',
    type: ['Beast', 'Data'],
    description: 'A Beast Digimon with a wolf-like appearance and ice attacks.',
    stats: { hp: 1480, mp: 720, attack: 135, defense: 105, spirit: 95, speed: 105 }
  },
  {
    id: 'angemon',
    name: 'Angemon',
    stage: 'Champion',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop',
    type: ['Angel', 'Vaccine'],
    description: 'An Angel Digimon with six shining wings.',
    stats: { hp: 1380, mp: 850, attack: 125, defense: 95, spirit: 125, speed: 100 }
  },
  {
    id: 'ikkakumon',
    name: 'Ikkakumon',
    stage: 'Champion',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&h=200&fit=crop',
    type: ['Sea Animal', 'Vaccine'],
    description: 'A Sea Animal Digimon with a horn and tough hide.',
    stats: { hp: 1550, mp: 700, attack: 140, defense: 130, spirit: 80, speed: 85 }
  },
  {
    id: 'birdramon',
    name: 'Birdramon',
    stage: 'Champion',
    image: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=200&h=200&fit=crop',
    type: ['Bird', 'Vaccine'],
    description: 'A Giant Bird Digimon with flaming wings.',
    stats: { hp: 1420, mp: 780, attack: 130, defense: 90, spirit: 120, speed: 110 }
  },
  {
    id: 'togemon',
    name: 'Togemon',
    stage: 'Champion',
    image: 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=200&h=200&fit=crop',
    type: ['Plant', 'Data'],
    description: 'A Vegetation Digimon covered in tough needle-like thorns.',
    stats: { hp: 1460, mp: 710, attack: 135, defense: 115, spirit: 90, speed: 80 }
  },
  
  // Ultimate
  {
    id: 'metalgreymon',
    name: 'MetalGreymon',
    stage: 'Ultimate',
    image: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=200&h=200&fit=crop',
    type: ['Dragon', 'Vaccine'],
    description: 'A Cyborg Digimon with over half its body mechanized.',
    stats: { hp: 2180, mp: 890, attack: 195, defense: 155, spirit: 120, speed: 115 }
  },
  {
    id: 'skullgreymon',
    name: 'SkullGreymon',
    stage: 'Ultimate',
    image: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=200&h=200&fit=crop',
    type: ['Dragon', 'Virus'],
    description: 'A dark evolution with a skeletal appearance.',
    stats: { hp: 2350, mp: 700, attack: 220, defense: 140, spirit: 90, speed: 105 }
  },
  {
    id: 'weregarurumon',
    name: 'WereGarurumon',
    stage: 'Ultimate',
    image: 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=200&h=200&fit=crop',
    type: ['Beast', 'Data'],
    description: 'A Beast Man Digimon with superior combat abilities.',
    stats: { hp: 2120, mp: 920, attack: 185, defense: 145, spirit: 130, speed: 125 }
  },
  {
    id: 'magnaangemon',
    name: 'MagnaAngemon',
    stage: 'Ultimate',
    image: 'https://images.unsplash.com/photo-1579546928937-641f7ac9bced?w=200&h=200&fit=crop',
    type: ['Angel', 'Vaccine'],
    description: 'A Seraph Digimon that possesses eight shining wings.',
    stats: { hp: 1980, mp: 1100, attack: 165, defense: 135, spirit: 175, speed: 120 }
  },
  {
    id: 'zudomon',
    name: 'Zudomon',
    stage: 'Ultimate',
    image: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=200&h=200&fit=crop',
    type: ['Sea Animal', 'Vaccine'],
    description: 'A powerful Sea Animal Digimon that wields a giant hammer.',
    stats: { hp: 2240, mp: 880, attack: 200, defense: 170, spirit: 115, speed: 105 }
  },
  {
    id: 'garudamon',
    name: 'Garudamon',
    stage: 'Ultimate',
    image: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=200&h=200&fit=crop',
    type: ['Bird', 'Vaccine'],
    description: 'A Bird Man Digimon with enormous wings.',
    stats: { hp: 2050, mp: 980, attack: 180, defense: 130, spirit: 155, speed: 135 }
  },
  {
    id: 'lilymon',
    name: 'Lilymon',
    stage: 'Ultimate',
    image: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=200&h=200&fit=crop',
    type: ['Plant', 'Data'],
    description: 'A Fairy Digimon that has the appearance of a beautiful flower.',
    stats: { hp: 1920, mp: 1020, attack: 170, defense: 120, spirit: 160, speed: 115 }
  },
  
  // Mega
  {
    id: 'wargreymon',
    name: 'WarGreymon',
    stage: 'Mega',
    image: 'https://images.unsplash.com/photo-1598610628806-88d5e7eddfb7?w=200&h=200&fit=crop',
    type: ['Dragon', 'Vaccine'],
    description: 'A Dragon Warrior Digimon clad in armor made from Chrome Digizoid.',
    stats: { hp: 3050, mp: 1150, attack: 265, defense: 210, spirit: 165, speed: 145 }
  },
  {
    id: 'blackwargreymon',
    name: 'BlackWarGreymon',
    stage: 'Mega',
    image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?w=200&h=200&fit=crop',
    type: ['Dragon', 'Virus'],
    description: 'A dark Dragon Warrior with immense power.',
    stats: { hp: 3100, mp: 1080, attack: 275, defense: 205, spirit: 155, speed: 150 }
  },
  {
    id: 'metalgarurumon',
    name: 'MetalGarurumon',
    stage: 'Mega',
    image: 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=200&h=200&fit=crop',
    type: ['Beast', 'Data'],
    description: 'A Cyborg Digimon with a body made from Chrome Digizoid metal.',
    stats: { hp: 2980, mp: 1200, attack: 250, defense: 195, spirit: 180, speed: 160 }
  },
  {
    id: 'seraphimon',
    name: 'Seraphimon',
    stage: 'Mega',
    image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=200&h=200&fit=crop',
    type: ['Angel', 'Vaccine'],
    description: 'One of the three Archangel Digimon that protects the Digital World.',
    stats: { hp: 2820, mp: 1380, attack: 230, defense: 185, spirit: 235, speed: 140 }
  },
  {
    id: 'vikemon',
    name: 'Vikemon',
    stage: 'Mega',
    image: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=200&h=200&fit=crop',
    type: ['Sea Animal', 'Vaccine'],
    description: 'A Viking warrior Digimon with immense strength.',
    stats: { hp: 3180, mp: 1100, attack: 270, defense: 235, spirit: 155, speed: 125 }
  },
  {
    id: 'phoenixmon',
    name: 'Phoenixmon',
    stage: 'Mega',
    image: 'https://images.unsplash.com/photo-1503516459261-40c66117780a?w=200&h=200&fit=crop',
    type: ['Bird', 'Vaccine'],
    description: 'A legendary Phoenix Digimon reborn from flames.',
    stats: { hp: 2890, mp: 1250, attack: 245, defense: 175, spirit: 210, speed: 155 }
  }
];

export const evolutions: Evolution[] = [
  // Koromon Line
  { from: 'koromon', to: 'agumon', requirements: 'Level 6' },
  
  // Agumon branching evolutions
  { from: 'agumon', to: 'greymon', requirements: 'Attack 95+' },
  { from: 'agumon', to: 'meramon', requirements: 'Spirit 80+' },
  
  // Greymon branching
  { from: 'greymon', to: 'metalgreymon', requirements: 'Dragon EXP 1500+' },
  { from: 'greymon', to: 'skullgreymon', requirements: 'Overfeed 3+, Disturb 5+' },
  
  // Meramon evolution
  { from: 'meramon', to: 'skullgreymon', requirements: 'Dark EXP 1200+' },
  
  // MetalGreymon branching
  { from: 'metalgreymon', to: 'wargreymon', requirements: 'Attack 250+' },
  { from: 'metalgreymon', to: 'blackwargreymon', requirements: 'Virus Type, Attack 250+' },
  
  // SkullGreymon evolution
  { from: 'skullgreymon', to: 'blackwargreymon', requirements: 'Level 55+' },
  
  // Tsunomon Line
  { from: 'tsunomon', to: 'gabumon', requirements: 'Level 6' },
  
  // Gabumon evolution
  { from: 'gabumon', to: 'garurumon', requirements: 'Speed 85+' },
  
  // Garurumon evolution
  { from: 'garurumon', to: 'weregarurumon', requirements: 'Beast EXP 1500+' },
  
  // WereGarurumon evolution
  { from: 'weregarurumon', to: 'metalgarurumon', requirements: 'Speed 240+' },
  
  // Tokomon Line
  { from: 'tokomon', to: 'patamon', requirements: 'Level 6' },
  
  // Patamon evolution
  { from: 'patamon', to: 'angemon', requirements: 'Spirit 100+' },
  
  // Angemon evolution
  { from: 'angemon', to: 'magnaangemon', requirements: 'Holy EXP 1500+' },
  
  // MagnaAngemon evolution
  { from: 'magnaangemon', to: 'seraphimon', requirements: 'Spirit 260+' },
  
  // Bukamon Line
  { from: 'bukamon', to: 'gomamon', requirements: 'Level 6' },
  { from: 'bukamon', to: 'biyomon', requirements: 'Level 6, Spirit 50+' },
  
  // Gomamon evolution
  { from: 'gomamon', to: 'ikkakumon', requirements: 'Defense 95+' },
  
  // Biyomon evolution
  { from: 'biyomon', to: 'birdramon', requirements: 'Speed 90+' },
  
  // Ikkakumon evolution
  { from: 'ikkakumon', to: 'zudomon', requirements: 'Aquan EXP 1500+' },
  
  // Birdramon evolution
  { from: 'birdramon', to: 'garudamon', requirements: 'Bird EXP 1500+' },
  
  // Zudomon evolution
  { from: 'zudomon', to: 'vikemon', requirements: 'HP 3000+' },
  
  // Garudamon evolution
  { from: 'garudamon', to: 'phoenixmon', requirements: 'Spirit 250+' },
  
  // Tanemon Line (No Mega evolution - ends at Ultimate)
  { from: 'tanemon', to: 'palmon', requirements: 'Level 6' },
  
  // Palmon evolution
  { from: 'palmon', to: 'togemon', requirements: 'Defense 85+' },
  
  // Togemon evolution (ends at Ultimate, no Mega)
  { from: 'togemon', to: 'lilymon', requirements: 'Plant EXP 1500+' }
];

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