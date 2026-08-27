import React, { useState } from 'react';
import { Search, Loader2, X, ArrowRight } from 'lucide-react';
import { useShipmentStore } from '../../store/useShipmentStore';

export const SearchBar = () => {
  const { searchShipment, searchedId, clearSearch, isLoading } = useShipmentStore();
  const [inputVal, setInputVal] = useState(searchedId || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      searchShipment(inputVal.trim());
    }
  };

  const handleClear = () => {
    setInputVal('');
    clearSearch();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search shipment ID (e.g. SHIP-1001, SHIP-1002)..."
          className="w-full pl-12 pr-28 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-lg shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-mono text-sm sm:text-base"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {inputVal && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Search</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
