'use client';

import { useState, useEffect } from 'react';

interface SearchFilterProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchFilter({
  placeholder = 'Search...',
  onSearch,
  initialValue = ''
}: SearchFilterProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 200);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full max-w-sm px-4 py-2 border border-neutral-200 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent
                   text-sm placeholder:text-neutral-400"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
