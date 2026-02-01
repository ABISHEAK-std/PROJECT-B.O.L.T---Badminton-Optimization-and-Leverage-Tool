import { Search, SlidersHorizontal, Calendar } from 'lucide-react';

interface FilterBarProps {
    onSearch: (query: string) => void;
}

export function FilterBar({ onSearch }: FilterBarProps) {
    return (
        <div className="flex items-center gap-4 mb-8">
            {/* Search Bar */}
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search sessions..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full bg-[#1A1A1A] text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600"
                />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] text-gray-300 rounded-xl border border-white/10 hover:bg-white/5 hover:text-white transition-colors">
                    <SlidersHorizontal size={16} />
                    <span className="text-sm font-semibold">High Score</span>
                </button>

                <button className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] text-gray-300 rounded-xl border border-white/10 hover:bg-white/5 hover:text-white transition-colors">
                    <Calendar size={16} />
                    <span className="text-sm font-semibold">Date</span>
                </button>
            </div>
        </div>
    );
}
