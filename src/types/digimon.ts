export type DigimonStage = 'In-Training' | 'Rookie' | 'Champion' | 'Ultimate' | 'Mega';

export interface Digimon {
  id: string;
  name: string;
  stage: DigimonStage;
  image: string;
  type: string[];
  description: string;
  exclusive?: 'Dawn' | 'Dusk';
  stats?: {
    hp: number;
    mp: number;
    attack: number;
    defense: number;
    spirit: number;
    speed: number;
  };
}

export interface Evolution {
  from: string;
  to: string;
  requirements?: string;
}

export interface EvolutionTree {
  digimon: Digimon[];
  evolutions: Evolution[];
}
