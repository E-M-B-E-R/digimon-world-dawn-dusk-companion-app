export function useEvolutionRequirements() {
  const formatRequirements = (reqs: Record<string, any> | undefined): string | undefined => {
    if (!reqs || Object.keys(reqs).length === 0) return undefined;
    const requirements: string[] = [];

    Object.entries(reqs).forEach(([key, value]) => {
      const valueStr = String(value);
      const containsBefriend = valueStr.toLowerCase().includes('befriend');
      const shouldAddPlus = typeof value === 'number' && !containsBefriend;
      const suffix = shouldAddPlus ? '+' : '';

      if (key === 'level') {
        requirements.push(`Level ${value}${suffix}`);
      } else if (key.endsWith('Exp')) {
        const formatted = key.replace(/Exp$/, '').replace(/([A-Z])/g, ' $1').trim();
        const capitalized = formatted
          .split(' ')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
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
      } else if (key === 'aptitude') {
        requirements.push(`Aptitude ${value}${suffix}`);
      } else if (key === 'totalExp') {
        requirements.push(`Total EXP ${value}${suffix}`);
      } else if (key === 'befriended') {
        if (Array.isArray(value)) {
          requirements.push(`Befriended ${value.join(', ')}`);
        } else {
          requirements.push(`Befriended ${value}`);
        }
      } else {
        requirements.push(`${key} ${value}${suffix}`);
      }
    });

    return requirements.length > 0 ? requirements.join(',\n') : undefined;
  };

  return { formatRequirements };
}
