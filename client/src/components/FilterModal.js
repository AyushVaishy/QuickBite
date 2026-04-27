import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSearch, FaLeaf } from 'react-icons/fa';
import { SORT_OPTIONS, RATING_OPTIONS, COST_OPTIONS, DELIVERY_TIME_OPTIONS } from '../store/filtersSlice';

const LEFT_PANELS = [
  { id: 'sort',         label: 'Sort by' },
  { id: 'cuisines',     label: 'Cuisines' },
  { id: 'rating',       label: 'Rating' },
  { id: 'cost',         label: 'Cost for two' },
  { id: 'deliveryTime', label: 'Delivery Time' },
];

const panelHasValue = (id, pending) => {
  if (id === 'sort')         return pending.sortBy !== 'popularity';
  if (id === 'cuisines')     return pending.cuisines.length > 0;
  if (id === 'rating')       return pending.rating !== null;
  if (id === 'cost')         return pending.costRange !== null;
  if (id === 'deliveryTime') return pending.deliveryTimeMax !== null;
  return false;
};

const countActive = (pending) =>
  LEFT_PANELS.filter((p) => panelHasValue(p.id, pending)).length;

/**
 * FilterModal
 * Props:
 *  isOpen      — boolean
 *  onClose     — () => void
 *  onApply     — (pendingFilters) => void   dispatches applyFilters
 *  current     — current Redux filter state
 *  allCuisines — string[] derived from loaded restaurants
 */
const FilterModal = ({ isOpen, onClose, onApply, current, allCuisines }) => {
  const [activePanel, setActivePanel] = useState('sort');
  const [pending, setPending]         = useState({ ...current });
  const [cuisineSearch, setCuisineSearch] = useState('');

  // Sync pending from Redux each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setPending({ ...current });
      setActivePanel('sort');
      setCuisineSearch('');
    }
  }, [isOpen]); // deliberately exclude `current` — only sync on open

  const handleClear = useCallback(() => {
    setPending({ sortBy: 'popularity', cuisines: [], rating: null, costRange: null, vegOnly: false, deliveryTimeMax: null });
  }, []);

  const handleApply = useCallback(() => {
    onApply(pending);
    onClose();
  }, [onApply, onClose, pending]);

  const toggleCuisine = useCallback((cuisine) => {
    setPending((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  }, []);

  if (!isOpen) return null;

  const filteredCuisines = allCuisines.filter((c) =>
    c.toLowerCase().includes(cuisineSearch.toLowerCase().trim())
  );

  const activeCount = countActive(pending);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col max-h-[92vh] sm:max-h-[82vh]">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
            {activeCount > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Close filters"
          >
            <FaTimes className="text-gray-500 dark:text-gray-400" size={14} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left nav panel */}
          <div className="w-36 sm:w-44 border-r border-gray-100 dark:border-gray-700 flex flex-col overflow-y-auto flex-shrink-0">
            {LEFT_PANELS.map((panel) => {
              const isActive  = activePanel === panel.id;
              const hasValue  = panelHasValue(panel.id, pending);
              return (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={`relative px-4 py-4 text-left text-sm font-medium border-l-[3px] transition-all ${
                    isActive
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  {panel.label}
                  {hasValue && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right content panel */}
          <div className="flex-1 p-5 overflow-y-auto">

            {/* ── Sort ── */}
            {activePanel === 'sort' && (
              <div className="space-y-4">
                {SORT_OPTIONS.map((opt) => {
                  const selected = pending.sortBy === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setPending((p) => ({ ...p, sortBy: opt.value }))}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selected
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-orange-300'
                        }`}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${selected ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* ── Cuisines ── */}
            {activePanel === 'cuisines' && (
              <div>
                <div className="relative mb-3">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                  <input
                    type="text"
                    placeholder="Search cuisines…"
                    value={cuisineSearch}
                    onChange={(e) => setCuisineSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                {pending.cuisines.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {pending.cuisines.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleCuisine(c)}
                        className="flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full font-medium"
                      >
                        {c} <FaTimes size={9} />
                      </button>
                    ))}
                  </div>
                )}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredCuisines.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No cuisines found</p>
                  ) : (
                    filteredCuisines.map((c) => {
                      const checked = pending.cuisines.includes(c);
                      return (
                        <label
                          key={c}
                          className="flex items-center gap-3 cursor-pointer group py-0.5"
                          onClick={() => toggleCuisine(c)}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              checked
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300 dark:border-gray-600 group-hover:border-orange-300'
                            }`}
                          >
                            {checked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${checked ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                            {c}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ── Rating ── */}
            {activePanel === 'rating' && (
              <div className="flex flex-wrap gap-3">
                {RATING_OPTIONS.map((opt) => {
                  const selected = pending.rating === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => setPending((p) => ({ ...p, rating: opt.value }))}
                      className={`px-5 py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
                        selected
                          ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-300'
                      }`}
                    >
                      {opt.label !== 'Any' && '⭐ '}{opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Cost ── */}
            {activePanel === 'cost' && (
              <div className="space-y-3">
                {COST_OPTIONS.map((opt) => {
                  const selected = pending.costRange === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => setPending((p) => ({ ...p, costRange: opt.value }))}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                        selected
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-200 dark:hover:border-orange-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Delivery Time ── */}
            {activePanel === 'deliveryTime' && (
              <div className="space-y-4">
                {DELIVERY_TIME_OPTIONS.map((opt) => {
                  const selected = pending.deliveryTimeMax === opt.value;
                  return (
                    <label
                      key={String(opt.value)}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setPending((p) => ({ ...p, deliveryTimeMax: opt.value }))}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          selected
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-orange-300'
                        }`}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${selected ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
          <button
            onClick={handleClear}
            className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition underline-offset-2 hover:underline"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-full transition shadow-md text-sm"
          >
            Apply{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterModal;
