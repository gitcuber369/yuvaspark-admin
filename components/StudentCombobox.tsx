'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Props {
  selected: string[];
  setSelected: (ids: string[]) => void;
}

export default function StudentCombobox({ selected, setSelected }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) return;

    const res = await fetch(`http://localhost:3000/api/students?search=${q}`);
    const data = await res.json();
    setResults(data);
  };

  const addStudent = (id: string) => {
    if (!selected.includes(id)) {
      setSelected([...selected, id]);
    }
  };

  return (
    <div>
      <Input
        placeholder="Search Students..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div className="space-y-1 mt-2">
        {results.map((s) => (
          <Button key={s.id} variant="ghost" onClick={() => addStudent(s.id)}>
            {s.name}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 mt-3 flex-wrap">
        {selected.map((id) => (
          <Badge key={id}>{id}</Badge>
        ))}
      </div>
    </div>
  );
}
