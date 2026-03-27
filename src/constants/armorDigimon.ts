export const ARMOR_DIGIMON_IDS = new Set([
  'flamedramon',
  'magnamon',
  'kenkimon',
  'seahomon',
  'toucanmon',
  'allomon',
  'shurimon',
  'pipismon',
  'ponchomon',
  'prairiemon',
  'aurumon',
  'shadramon',
  'kongoumon',
  'tylomon',
  'kabukimon',
  'lanksmon',
]);

export const isArmorDigimon = (id: string) => ARMOR_DIGIMON_IDS.has(id);
