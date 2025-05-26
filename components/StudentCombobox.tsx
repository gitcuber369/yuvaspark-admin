'use client';

import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { API_URL } from "@/lib/config";
import { useDebounce } from 'use-debounce';

interface Props {
  selected: string[];
  setSelected: (ids: string[]) => void;
}

interface Student {
  id: string;
  name: string;
}

export default function StudentCombobox({ selected, setSelected }: Props) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);

  // Fetch selected students data when component mounts or selected ids change
  useEffect(() => {
    const fetchSelectedStudents = async () => {
      if (selected.length === 0) {
        setSelectedStudents([]);
        return;
      }

      try {
        const res = await fetch(`${API_URL}students?ids=${selected.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedStudents(data);
        }
      } catch (error) {
        console.error("Error fetching selected students:", error);
      }
    };

    fetchSelectedStudents();
  }, [selected]);

  // Search effect that triggers when debounced query changes
  useEffect(() => {
    const searchStudents = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(`${API_URL}students?search=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out already selected students from results
          const filteredData = data.filter((student: Student) => !selected.includes(student.id));
          setResults(filteredData);
        }
      } catch (error) {
        console.error("Error searching students:", error);
        setResults([]);
      }
    };

    searchStudents();
  }, [debouncedQuery, selected]);

  const addStudent = (student: Student) => {
    if (!selected.includes(student.id)) {
      setSelected([...selected, student.id]);
      setResults(results.filter(r => r.id !== student.id));
      setQuery('');
    }
  };

  const removeStudent = (id: string) => {
    setSelected(selected.filter(studentId => studentId !== id));
  };

  return (
    <div>
      <Input
        placeholder="Search Students by Name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2"
      />
      
      {results.length > 0 && (
        <div className="bg-white p-2 border rounded-md shadow-sm mb-3 max-h-40 overflow-y-auto">
          {results.map((student) => (
            <Button 
              key={student.id} 
              variant="ghost" 
              size="sm"
              onClick={() => addStudent(student)}
              className="w-full justify-start text-sm hover:bg-gray-100 mb-1"
            >
              {student.name}
            </Button>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 mt-2 flex-wrap">
        {selectedStudents.map((student) => (
          <Badge key={student.id} className="px-3 py-1 flex items-center gap-1">
            {student.name}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 ml-1" 
              onClick={() => removeStudent(student.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
