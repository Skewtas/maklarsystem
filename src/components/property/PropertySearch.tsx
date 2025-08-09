/**
 * PropertySearch - Advanced search and filter component for properties
 * 
 * Features text search, price/area ranges, property type filters,
 * location filters, and Swedish-specific real estate filters.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  MapPin, 
  Home, 
  CreditCard, 
  Ruler, 
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  Building,
  Trees,
  Map
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  PropertySearchProps, 
  PropertySearchParams, 
  PropertyType, 
  PropertyStatus,
  PropertyTypeLabels,
  PropertyStatusLabels
} from '@/types/property.types';
import { formatSEK } from '@/lib/utils/property.utils';

// ============================================================
// GLASSMORPHISM STYLES
// ============================================================

const glassStyles = {
  container: cn(
    "backdrop-blur-xl",
    "bg-white/10",
    "border border-white/20",
    "shadow-2xl",
    "rounded-2xl"
  ),
  searchBar: cn(
    "relative flex items-center gap-3",
    "p-4 mb-4",
    "bg-white/5 border border-white/10",
    "rounded-xl"
  ),
  searchInput: cn(
    "flex-1 px-4 py-3",
    "bg-transparent",
    "text-white placeholder-white/50 text-lg",
    "focus:outline-none",
    "border-0"
  ),
  filterSection: cn(
    "p-4 border-t border-white/10"
  ),
  filterGroup: "space-y-4",
  filterHeader: cn(
    "flex items-center justify-between",
    "cursor-pointer group",
    "py-2"
  ),
  filterTitle: "text-white font-medium flex items-center gap-2 group-hover:text-blue-200 transition-colors",
  filterContent: "space-y-3 pt-3",
  input: cn(
    "w-full px-3 py-2",
    "bg-white/5",
    "border border-white/10",
    "rounded-lg",
    "text-white text-sm placeholder-white/50",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "focus:border-transparent",
    "transition-all duration-200"
  ),
  select: cn(
    "w-full px-3 py-2",
    "bg-white/5",
    "border border-white/10",
    "rounded-lg",
    "text-white text-sm",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "focus:border-transparent",
    "appearance-none cursor-pointer",
    "transition-all duration-200"
  ),
  checkbox: cn(
    "w-4 h-4",
    "bg-white/5 border border-white/20",
    "rounded",
    "text-blue-500",
    "focus:ring-2 focus:ring-blue-400/50"
  ),
  checkboxLabel: "text-white text-sm cursor-pointer flex items-center gap-2",
  rangeContainer: "grid grid-cols-1 md:grid-cols-2 gap-3",
  rangeInput: cn(
    "px-3 py-2",
    "bg-white/5",
    "border border-white/10",
    "rounded-lg",
    "text-white text-sm placeholder-white/50",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "focus:border-transparent"
  ),
  button: cn(
    "px-4 py-2",
    "bg-gradient-to-r from-blue-500/80 to-purple-500/80",
    "hover:from-blue-600/80 hover:to-purple-600/80",
    "text-white font-medium text-sm",
    "rounded-lg",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "flex items-center gap-2"
  ),
  resetButton: cn(
    "px-4 py-2",
    "bg-white/5 hover:bg-white/10",
    "border border-white/10 hover:border-white/20",
    "text-white/70 hover:text-white",
    "text-sm rounded-lg",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "flex items-center gap-2"
  ),
  toggleButton: cn(
    "px-3 py-2",
    "bg-white/5 hover:bg-white/10",
    "border border-white/10 hover:border-white/20",
    "text-white/70 hover:text-white",
    "text-sm rounded-lg",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "flex items-center gap-2 md:hidden"
  ),
  activeFilters: "flex flex-wrap gap-2 p-4 border-t border-white/10",
  filterTag: cn(
    "px-3 py-1",
    "bg-blue-500/20 border border-blue-500/30",
    "text-blue-200 text-sm",
    "rounded-full",
    "flex items-center gap-2"
  ),
  removeTag: "hover:text-blue-100 cursor-pointer transition-colors",
  resultsCount: "text-white/70 text-sm px-4 py-2"
};

// ============================================================
// PROPERTY TYPE ICONS
// ============================================================

const PropertyTypeIconMap = {
  villa: Home,
  lagenhet: Building,
  radhus: Building,
  tomt: Map,
  fritidshus: Trees
};

// ============================================================
// FILTER STATE TYPE
// ============================================================

interface FilterState {
  query: string;
  propertyTypes: PropertyType[];
  statuses: PropertyStatus[];
  priceRange: { min: string; max: string };
  areaRange: { min: string; max: string };
  roomsRange: { min: string; max: string };
  buildYearRange: { min: string; max: string };
  city: string;
  municipality: string;
}

interface ExpandedSections {
  [key: string]: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function PropertySearch({
  initialFilters = {},
  onSearch,
  onReset,
  filterOptions,
  isLoading = false,
  className
}: PropertySearchProps) {
  const [filters, setFilters] = useState<FilterState>({
    query: initialFilters.query || '',
    propertyTypes: initialFilters.propertyTypes || [],
    statuses: initialFilters.statuses || [],
    priceRange: {
      min: initialFilters.priceMin?.toString() || '',
      max: initialFilters.priceMax?.toString() || ''
    },
    areaRange: {
      min: initialFilters.areaMin?.toString() || '',
      max: initialFilters.areaMax?.toString() || ''
    },
    roomsRange: {
      min: initialFilters.roomsMin?.toString() || '',
      max: initialFilters.roomsMax?.toString() || ''
    },
    buildYearRange: {
      min: initialFilters.buildYearMin?.toString() || '',
      max: initialFilters.buildYearMax?.toString() || ''
    },
    city: initialFilters.city || '',
    municipality: initialFilters.municipality || ''
  });

  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    location: true,
    type: true,
    price: true,
    area: true,
    rooms: true,
    buildYear: true
  });

  const [showFilters, setShowFilters] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Check if filters are active
  useEffect(() => {
    const hasFilters = Boolean(
      filters.query ||
      filters.propertyTypes.length > 0 ||
      filters.statuses.length > 0 ||
      filters.priceRange.min ||
      filters.priceRange.max ||
      filters.areaRange.min ||
      filters.areaRange.max ||
      filters.roomsRange.min ||
      filters.roomsRange.max ||
      filters.buildYearRange.min ||
      filters.buildYearRange.max ||
      filters.city ||
      filters.municipality
    );
    setHasActiveFilters(hasFilters);
  }, [filters]);

  // Handle search
  const performSearch = useCallback(() => {
    const searchParams: PropertySearchParams = {
      query: filters.query || undefined,
      propertyTypes: filters.propertyTypes.length > 0 ? filters.propertyTypes : undefined,
      statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
      priceMin: filters.priceRange.min ? parseInt(filters.priceRange.min) : undefined,
      priceMax: filters.priceRange.max ? parseInt(filters.priceRange.max) : undefined,
      areaMin: filters.areaRange.min ? parseInt(filters.areaRange.min) : undefined,
      areaMax: filters.areaRange.max ? parseInt(filters.areaRange.max) : undefined,
      roomsMin: filters.roomsRange.min ? parseInt(filters.roomsRange.min) : undefined,
      roomsMax: filters.roomsRange.max ? parseInt(filters.roomsRange.max) : undefined,
      buildYearMin: filters.buildYearRange.min ? parseInt(filters.buildYearRange.min) : undefined,
      buildYearMax: filters.buildYearRange.max ? parseInt(filters.buildYearRange.max) : undefined,
      city: filters.city || undefined,
      municipality: filters.municipality || undefined
    };
    
    onSearch(searchParams);
  }, [filters, onSearch]);

  // Debounce search input changes
  useEffect(() => {
    if (!filters.query) return;
    const t = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(t);
  }, [filters.query, performSearch]);

  // Handle reset
  const handleReset = useCallback(() => {
    setFilters({
      query: '',
      propertyTypes: [],
      statuses: [],
      priceRange: { min: '', max: '' },
      areaRange: { min: '', max: '' },
      roomsRange: { min: '', max: '' },
      buildYearRange: { min: '', max: '' },
      city: '',
      municipality: ''
    });
    onReset();
  }, [onReset]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleRangeChange = useCallback((rangeField: keyof FilterState, subField: 'min' | 'max', value: string) => {
    setFilters(prev => ({
      ...prev,
      [rangeField]: {
        ...(prev[rangeField] as any),
        [subField]: value
      }
    }));
  }, []);

  const handleArrayToggle = useCallback((field: keyof FilterState, value: any) => {
    setFilters(prev => {
      const array = prev[field] as any[];
      const index = array.indexOf(value);
      
      if (index >= 0) {
        return {
          ...prev,
          [field]: array.filter((_, i) => i !== index)
        };
      } else {
        return {
          ...prev,
          [field]: [...array, value]
        };
      }
    });
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Get active filter tags
  const getActiveFilterTags = useCallback(() => {
    const tags: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.query) {
      tags.push({
        key: 'query',
        label: `"${filters.query}"`,
        onRemove: () => handleInputChange('query', '')
      });
    }

    filters.propertyTypes.forEach(type => {
      tags.push({
        key: `type-${type}`,
        label: PropertyTypeLabels[type],
        onRemove: () => handleArrayToggle('propertyTypes', type)
      });
    });

    filters.statuses.forEach(status => {
      tags.push({
        key: `status-${status}`,
        label: PropertyStatusLabels[status],
        onRemove: () => handleArrayToggle('statuses', status)
      });
    });

    if (filters.priceRange.min || filters.priceRange.max) {
      const min = filters.priceRange.min ? formatSEK(parseInt(filters.priceRange.min)) : '';
      const max = filters.priceRange.max ? formatSEK(parseInt(filters.priceRange.max)) : '';
      tags.push({
        key: 'price',
        label: `Pris: ${min || '0'} - ${max || '∞'}`,
        onRemove: () => handleInputChange('priceRange', { min: '', max: '' })
      });
    }

    if (filters.areaRange.min || filters.areaRange.max) {
      tags.push({
        key: 'area',
        label: `Yta: ${filters.areaRange.min || '0'} - ${filters.areaRange.max || '∞'} m²`,
        onRemove: () => handleInputChange('areaRange', { min: '', max: '' })
      });
    }

    if (filters.city) {
      tags.push({
        key: 'city',
        label: `Stad: ${filters.city}`,
        onRemove: () => handleInputChange('city', '')
      });
    }

    return tags;
  }, [filters, handleInputChange, handleArrayToggle]);

  const activeFilterTags = getActiveFilterTags();

  return (
    <div className={cn(glassStyles.container, className)} role="form">
      {/* Search Bar */}
      <div className={glassStyles.searchBar}>
        <Search size={24} className="text-white/50 flex-shrink-0" />
        <label htmlFor="search-input" className="sr-only">Sökord</label>
        <input
          type="search"
          role="searchbox"
          id="search-input"
          aria-label="Sökord"
          placeholder="Sök efter fastigheter, adresser, områden..."
          value={filters.query}
          onChange={(e) => handleInputChange('query', e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              performSearch();
            }
          }}
          className={glassStyles.searchInput}
          disabled={isLoading}
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            glassStyles.toggleButton,
            hasActiveFilters && "bg-blue-500/20 border-blue-500/30 text-blue-200"
          )}
          aria-label="Visa filter"
          tabIndex={-1}
        >
          <SlidersHorizontal size={16} />
          Filter
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {activeFilterTags.length}
            </span>
          )}
        </button>
        <button
          onClick={performSearch}
          disabled={isLoading}
          className={glassStyles.button}
          aria-label="Sök"
          tabIndex={-1}
        >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                <Search size={16} />
                Sök
              </>
            )}
          </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {(showFilters || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={glassStyles.filterSection}
          >
            <div className={glassStyles.filterGroup}>
              {/* Location Filters */}
              <div>
                <button
                  onClick={() => toggleSection('location')}
                  className={glassStyles.filterHeader}
                  tabIndex={-1}
                >
                  <h3 className={glassStyles.filterTitle}>
                    <MapPin size={18} />
                    Plats
                  </h3>
                  {expandedSections.location ? (
                    <ChevronUp size={20} className="text-white/50" />
                  ) : (
                    <ChevronDown size={20} className="text-white/50" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.location && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={glassStyles.filterContent}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="city-select" className="block text-white/70 text-sm mb-1">Stad</label>
                          {filterOptions?.cities ? (
                            <select
                              id="city-select"
                              aria-label="Stad"
                              value={filters.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              className={glassStyles.select}
                              tabIndex={-1}
                            >
                              <option value="">Välj stad</option>
                              {filterOptions.cities.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="Stockholm, Göteborg..."
                              value={filters.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              className={glassStyles.input}
                            />
                          )}
                        </div>
                        <div>
                          <label htmlFor="municipality-select" className="block text-white/70 text-sm mb-1">Kommun</label>
                          {filterOptions?.municipalities ? (
                            <select
                              id="municipality-select"
                              aria-label="Kommun"
                              value={filters.municipality}
                              onChange={(e) => handleInputChange('municipality', e.target.value)}
                              className={glassStyles.select}
                              tabIndex={-1}
                            >
                              <option value="">Välj kommun</option>
                              {filterOptions.municipalities.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="Stockholms kommun..."
                              value={filters.municipality}
                              onChange={(e) => handleInputChange('municipality', e.target.value)}
                              className={glassStyles.input}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Property Type Filters */}
              <div>
                <button
                  onClick={() => toggleSection('type')}
                  className={glassStyles.filterHeader}
                  tabIndex={-1}
                >
                  <h3 className={glassStyles.filterTitle}>
                    <Home size={18} />
                    Fastighetstyp
                  </h3>
                  {expandedSections.type ? (
                    <ChevronUp size={20} className="text-white/50" />
                  ) : (
                    <ChevronDown size={20} className="text-white/50" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.type && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={glassStyles.filterContent}
                    >
                      <div className="space-y-2">
                        {(filterOptions?.propertyTypes || Object.entries(PropertyTypeLabels).map(([value, label]) => ({ value, label, count: undefined }))).map((pt: any) => {
                          const value = pt.value ?? pt[0];
                          const label = pt.label ?? pt[1];
                          const count = pt.count as number | undefined;
                          const Icon = PropertyTypeIconMap[value as PropertyType] || Building;
                          return (
                            <label key={value} className={glassStyles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={filters.propertyTypes.includes(value as PropertyType)}
                                onChange={() => handleArrayToggle('propertyTypes', value as PropertyType)}
                                className={glassStyles.checkbox}
                              />
                              <Icon size={16} className="text-white/70" />
                              <span>{label}{typeof count === 'number' ? ` (${count})` : ''}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="mt-4">
                        <label className="block text-white/70 text-sm mb-2">Status</label>
                        <div className="space-y-2">
                          {Object.entries(PropertyStatusLabels).map(([status, label]) => (
                            <label key={status} className={glassStyles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={filters.statuses.includes(status as PropertyStatus)}
                                onChange={() => handleArrayToggle('statuses', status as PropertyStatus)}
                                className={glassStyles.checkbox}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price Filters */}
              <div>
                <button
                  onClick={() => toggleSection('price')}
                  className={glassStyles.filterHeader}
                  tabIndex={-1}
                >
                  <h3 className={glassStyles.filterTitle}>
                    <CreditCard size={18} />
                    Pris
                  </h3>
                  {expandedSections.price ? (
                    <ChevronUp size={20} className="text-white/50" />
                  ) : (
                    <ChevronDown size={20} className="text-white/50" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.price && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={glassStyles.filterContent}
                    >
                      {/* Presets */}
                      {filterOptions?.priceRanges && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {filterOptions.priceRanges.map((r) => (
                            <button
                              key={`${r.min}-${r.max}`}
                              type="button"
                              className={glassStyles.resetButton}
                              onClick={() => handleInputChange('priceRange', { min: r.min?.toString() || '', max: r.max?.toString() || '' })}
                            >
                              {r.label} ({r.count})
                            </button>
                          ))}
                        </div>
                      )}
                      <div className={glassStyles.rangeContainer}>
                        <div>
                          <label htmlFor="price-min" className="block text-white/70 text-sm mb-1">Minpris</label>
                          <input
                            type="number"
                            min="0"
                            step="100000"
                            placeholder="0"
                            value={filters.priceRange.min}
                            onChange={(e) => handleRangeChange('priceRange', 'min', e.target.value)}
                            className={glassStyles.rangeInput}
                            id="price-min"
                            aria-label="Minpris"
                          />
                        </div>
                        <div>
                          <label htmlFor="price-max" className="block text-white/70 text-sm mb-1">Maxpris</label>
                          <input
                            type="number"
                            min="0"
                            step="100000"
                            placeholder="Obegränsat"
                            value={filters.priceRange.max}
                            onChange={(e) => handleRangeChange('priceRange', 'max', e.target.value)}
                            className={glassStyles.rangeInput}
                            id="price-max"
                            aria-label="Maxpris"
                          />
                        </div>
                      </div>
                      {/* Price validation */}
                      {filters.priceRange.min && filters.priceRange.max && parseInt(filters.priceRange.min) > parseInt(filters.priceRange.max) && (
                        <div role="alert" className="text-red-300 text-sm mt-2">Minpris kan inte vara högre än maxpris</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Area */}
              <div>
                <button onClick={() => toggleSection('area')} className={glassStyles.filterHeader} tabIndex={-1}>
                  <h3 className={glassStyles.filterTitle}>
                    <Ruler size={18} />
                    Yta
                  </h3>
                  {expandedSections.area ? <ChevronUp size={20} className="text-white/50" /> : <ChevronDown size={20} className="text-white/50" />}
                </button>
                <AnimatePresence>
                  {expandedSections.area && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={glassStyles.filterContent}>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">Boarea (m²)</label>
                        <div className={glassStyles.rangeContainer}>
                          <label htmlFor="area-min" className="block text-white/70 text-sm mb-1">Minyta</label>
                          <input type="number" min="0" step="10" placeholder="0" value={filters.areaRange.min} onChange={(e) => handleRangeChange('areaRange', 'min', e.target.value)} className={glassStyles.rangeInput} id="area-min" aria-label="Minyta" />
                          <label htmlFor="area-max" className="block text-white/70 text-sm mb-1">Maxyta</label>
                          <input type="number" min="0" step="10" placeholder="Obegränsat" value={filters.areaRange.max} onChange={(e) => handleRangeChange('areaRange', 'max', e.target.value)} className={glassStyles.rangeInput} id="area-max" aria-label="Maxyta" />
                        </div>
                        {filters.areaRange.min && filters.areaRange.max && parseInt(filters.areaRange.min) > parseInt(filters.areaRange.max) && (
                          <div role="alert" className="text-red-300 text-sm mt-2">Minyta kan inte vara större än maxyta</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Rooms */}
              <div>
                <button onClick={() => toggleSection('rooms')} className={glassStyles.filterHeader} tabIndex={-1}>
                  <h3 className={glassStyles.filterTitle}>Rum</h3>
                  {expandedSections.rooms ? <ChevronUp size={20} className="text-white/50" /> : <ChevronDown size={20} className="text-white/50" />}
                </button>
                <AnimatePresence>
                  {expandedSections.rooms && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={glassStyles.filterContent}>
                      <div className={glassStyles.rangeContainer}>
                        <div>
                          <label htmlFor="min-rooms" className="block text-white/70 text-sm mb-1">Minrum</label>
                          <select id="min-rooms" aria-label="Minrum" className={glassStyles.select} value={filters.roomsRange.min} onChange={(e) => handleRangeChange('roomsRange', 'min', e.target.value)}>
                            <option value="">Välj</option>
                            {Array.from({ length: 20 }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="max-rooms" className="block text-white/70 text-sm mb-1">Maxrum</label>
                          <select id="max-rooms" aria-label="Maxrum" className={glassStyles.select} value={filters.roomsRange.max} onChange={(e) => handleRangeChange('roomsRange', 'max', e.target.value)}>
                            <option value="">Välj</option>
                            {Array.from({ length: 20 }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Build Year */}
              <div>
                <button onClick={() => toggleSection('buildYear')} className={glassStyles.filterHeader} tabIndex={-1}>
                  <h3 className={glassStyles.filterTitle}>Byggår</h3>
                  {expandedSections.buildYear ? <ChevronUp size={20} className="text-white/50" /> : <ChevronDown size={20} className="text-white/50" />}
                </button>
                <AnimatePresence>
                  {expandedSections.buildYear && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={glassStyles.filterContent}>
                      <div className={glassStyles.rangeContainer}>
                        <div>
                          <label htmlFor="year-min" className="block text-white/70 text-sm mb-1">Äldst</label>
                          <input type="number" min="1800" max={new Date().getFullYear()} placeholder="1800" value={filters.buildYearRange.min} onChange={(e) => handleRangeChange('buildYearRange', 'min', e.target.value)} className={glassStyles.rangeInput} id="year-min" aria-label="Äldst" />
                        </div>
                        <div>
                          <label htmlFor="year-max" className="block text-white/70 text-sm mb-1">Nyast</label>
                          <input type="number" min="1800" max={new Date().getFullYear()} placeholder={new Date().getFullYear().toString()} value={filters.buildYearRange.max} onChange={(e) => handleRangeChange('buildYearRange', 'max', e.target.value)} className={glassStyles.rangeInput} id="year-max" aria-label="Nyast" />
                        </div>
                      </div>
                      {filters.buildYearRange.max && parseInt(filters.buildYearRange.max) > new Date().getFullYear() && (
                        <div role="alert" className="text-red-300 text-sm mt-2">Byggår kan inte vara i framtiden</div>
                      )}
                      {filters.buildYearRange.min && filters.buildYearRange.max && parseInt(filters.buildYearRange.min) > parseInt(filters.buildYearRange.max) && (
                        <div role="alert" className="text-red-300 text-sm mt-2">Äldsta året kan inte vara senare än nyaste</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={performSearch}
                disabled={isLoading}
                className={glassStyles.button}
                aria-label="Uppdatera"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span className="ml-2">Söker...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Uppdatera
                  </>
                )}
              </button>
              
              <button
                onClick={handleReset}
                className={glassStyles.resetButton}
                aria-label="Rensa filter"
                disabled={!hasActiveFilters}
              >
                <RotateCcw size={16} />
                Rensa filter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className={glassStyles.activeFilters}>
          <div className="flex flex-wrap gap-2">
            {activeFilterTags.map(tag => (
              <div key={tag.key} className={glassStyles.filterTag}>
                <span>{tag.label}</span>
                <button
                  onClick={tag.onRemove}
                  className={glassStyles.removeTag}
                  aria-label={`Ta bort filter: ${tag.label}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      {filterOptions && (
        <div className={glassStyles.resultsCount}>
          Visar resultat för aktuella filter
        </div>
      )}
    </div>
  );
}