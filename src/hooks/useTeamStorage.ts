import { useState, useEffect } from 'react';

const TEAM_STORAGE_KEY = 'digimon-team';
const MAX_TEAM_SIZE = 6;

function compactAndPad(ids: Array<string | null | undefined>, size: number): Array<string | null> {
  const compact = ids.filter(Boolean) as string[];
  return [...compact, ...Array(Math.max(0, size - compact.length)).fill(null)];
}

export function useTeamStorage(maxSize = MAX_TEAM_SIZE) {
  const [team, setTeam] = useState<Array<string | null>>(Array(maxSize).fill(null));

  useEffect(() => {
    const saved = localStorage.getItem(TEAM_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTeam(compactAndPad(parsed, maxSize).slice(0, maxSize));
        }
      } catch (e) {
        console.error('Failed to load team:', e);
      }
    }
  }, [maxSize]);

  useEffect(() => {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team.filter(Boolean)));
  }, [team]);

  const addToTeam = (id: string, slot?: number | null) => {
    setTeam(prev => {
      const next = [...prev];
      if (slot != null) {
        next[slot] = id;
      } else {
        const emptyIndex = next.findIndex(s => s == null);
        if (emptyIndex !== -1) {
          next[emptyIndex] = id;
        } else {
          return prev; // team full
        }
      }
      return compactAndPad(next, maxSize);
    });
  };

  const removeFromTeam = (index: number) => {
    setTeam(prev => {
      const next = [...prev];
      next[index] = null;
      return compactAndPad(next, maxSize);
    });
  };

  const isFull = team.filter(Boolean).length >= maxSize;

  return { team, addToTeam, removeFromTeam, isFull };
}
