import { useState } from 'react';
import { Digimon } from '../types/digimon';

export function useDigimonSearch(digimonData: Digimon[]) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Digimon[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) {
      setSuggestions(
        digimonData.filter(d => d.name.toLowerCase().includes(q.toLowerCase()))
      );
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const clear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return { query, suggestions, showSuggestions, setShowSuggestions, handleSearch, clear };
}
