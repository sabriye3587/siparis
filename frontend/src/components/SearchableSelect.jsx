import { useEffect, useRef, useState } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

/**
 * Aranabilir dropdown bileşeni
 *
 * Props:
 * - options: [{ value, label, sublabel }] — Seçenekler
 * - value: Seçili değer
 * - onChange: (value, option) => void
 * - placeholder: "Tedarikçi ara..."
 * - emptyMessage: "Sonuç bulunamadı"
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Ara...',
  emptyMessage = 'Sonuç bulunamadı',
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Seçili olanı bul
  const selected = options.find((o) => o.value === value);

  // Dışa tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Açılınca input'a odaklan
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filtreleme
  const filtered = options.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.label?.toLowerCase().includes(q) ||
      o.sublabel?.toLowerCase().includes(q) ||
      String(o.value)?.toLowerCase().includes(q)
    );
  });

  // Klavye navigasyonu
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
    }
  };

  const handleSelect = (option) => {
    onChange(option.value, option);
    setOpen(false);
    setSearch('');
    setHighlightedIndex(0);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('', null);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Kapalıyken gösterilen buton */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-3 py-2.5 border rounded-lg text-left flex items-center justify-between gap-2 transition ${
          open
            ? 'border-green-500 ring-2 ring-green-500/20'
            : 'border-gray-300 hover:border-gray-400'
        } bg-white`}
      >
        <span
          className={`truncate ${selected ? 'text-gray-800' : 'text-gray-400'}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <span
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-100 rounded transition"
              title="Temizle"
            >
              <X size={14} className="text-gray-400" />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Açıkken gösterilen dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 flex flex-col">
          {/* Arama input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Seçenekler */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              filtered.map((option, idx) => {
                const isSelected = option.value === value;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-3 py-2.5 text-left flex items-center justify-between gap-2 transition border-b border-gray-50 last:border-0 ${
                      isHighlighted ? 'bg-green-50' : 'hover:bg-gray-50'
                    } ${isSelected ? 'bg-green-50/60' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {option.label}
                      </div>
                      {option.sublabel && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {option.sublabel}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-green-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Alt bilgi: kaç sonuç */}
          <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
            <span>{filtered.length} sonuç</span>
            <span>↑↓ ile gezin, Enter ile seç</span>
          </div>
        </div>
      )}
    </div>
  );
}