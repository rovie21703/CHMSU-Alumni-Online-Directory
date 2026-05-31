import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type SearchableSelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: readonly string[];
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    includeOthers?: boolean;
    othersLabel?: string;
    className?: string;
    triggerClassName?: string;
};

export function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = 'SELECT AN OPTION',
    disabled = false,
    error,
    includeOthers = true,
    othersLabel = 'OTHERS',
    className = '',
    triggerClassName = '',
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        const query = search.trim().toLowerCase();

        const matches = query
            ? options.filter((option) => option.toLowerCase().includes(query))
            : [...options];

        if (includeOthers && othersLabel.toLowerCase().includes(query)) {
            return [othersLabel, ...matches.filter((option) => option !== othersLabel)];
        }

        return matches;
    }, [options, search, includeOthers, othersLabel]);

    const displayValue = value || placeholder;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open) {
            setSearch('');
        }
    }, [open]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((previous) => !previous)}
                className={`flex min-h-11 w-full touch-manipulation items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left text-base sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1A5336]/30 focus:border-[#1A5336] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${value ? 'text-gray-800' : 'text-gray-400'} ${triggerClassName}`}
            >
                <span className="truncate">{displayValue}</span>
                <ChevronDown size={16} className="ml-2 flex-shrink-0 text-gray-400" />
            </button>

            {open && !disabled && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 p-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search..."
                                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#1A5336] focus:outline-none focus:ring-2 focus:ring-[#1A5336]/20"
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {filteredOptions.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-gray-500">No matches found.</li>
                        ) : (
                            filteredOptions.map((option) => (
                                <li key={option}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(option);
                                            setOpen(false);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#E8F0EC] ${value === option ? 'bg-[#E8F0EC] font-medium text-[#1A5336]' : 'text-gray-800'}`}
                                    >
                                        {option}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
