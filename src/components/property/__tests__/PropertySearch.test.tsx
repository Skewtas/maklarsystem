/**
 * PropertySearch Component Tests
 * 
 * Tests for the property search and filter component including
 * form interactions, Swedish-specific filters, and search functionality.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PropertySearch } from '../PropertySearch';
import type { PropertySearchParams, PropertyFilterOptions } from '@/types/property.types';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock window.innerWidth for responsive behavior
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

const mockFilterOptions: PropertyFilterOptions = {
  cities: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'],
  municipalities: ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Solna', 'Nacka'],
  propertyTypes: [
    { value: 'villa', label: 'Villa', count: 45 },
    { value: 'lagenhet', label: 'Lägenhet', count: 123 },
    { value: 'radhus', label: 'Radhus', count: 32 },
    { value: 'tomt', label: 'Tomt', count: 12 },
    { value: 'fritidshus', label: 'Fritidshus', count: 8 }
  ],
  priceRanges: [
    { min: 0, max: 2000000, label: 'Under 2 miljoner', count: 25 },
    { min: 2000000, max: 5000000, label: '2-5 miljoner', count: 89 },
    { min: 5000000, max: 10000000, label: '5-10 miljoner', count: 67 },
    { min: 10000000, max: null, label: 'Över 10 miljoner', count: 34 }
  ],
  areaRanges: [
    { min: 0, max: 50, label: 'Under 50 m²', count: 12 },
    { min: 50, max: 100, label: '50-100 m²', count: 78 },
    { min: 100, max: 150, label: '100-150 m²', count: 89 },
    { min: 150, max: null, label: 'Över 150 m²', count: 45 }
  ]
};

describe('PropertySearch', () => {
  const defaultProps = {
    onSearch: jest.fn(),
    onReset: jest.fn(),
    filterOptions: mockFilterOptions
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================
  // BASIC RENDERING TESTS
  // ============================================================

  it('should render search form with all filter sections', () => {
    render(<PropertySearch {...defaultProps} />);
    
    // Main search input
    expect(screen.getByRole('searchbox', { name: /sökord/i })).toBeInTheDocument();
    
    // Filter sections
    expect(screen.getByText('Fastighetstyp')).toBeInTheDocument();
    expect(screen.getByText('Pris')).toBeInTheDocument();
    expect(screen.getByText('Yta')).toBeInTheDocument();
    expect(screen.getByText('Plats')).toBeInTheDocument();
    expect(screen.getByText('Rum')).toBeInTheDocument();
    expect(screen.getByText('Byggår')).toBeInTheDocument();
    
    // Action buttons
    expect(screen.getByRole('button', { name: /sök/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rensa filter/i })).toBeInTheDocument();
  });

  it('should render with initial filters', () => {
    const initialFilters: Partial<PropertySearchParams> = {
      query: 'Stockholm villa',
      propertyTypes: ['villa'],
      priceMin: 2000000,
      priceMax: 5000000,
      city: 'Stockholm'
    };

    render(
      <PropertySearch 
        {...defaultProps} 
        initialFilters={initialFilters}
      />
    );
    
    // Search input should have initial value
    expect(screen.getByDisplayValue('Stockholm villa')).toBeInTheDocument();
    
    // Villa checkbox should be checked
    expect(screen.getByRole('checkbox', { name: /villa/i })).toBeChecked();
    
    // City should be selected
    expect(screen.getByDisplayValue('Stockholm')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<PropertySearch {...defaultProps} isLoading={true} />);
    
    const searchButton = screen.getByRole('button', { name: /sök/i });
    expect(searchButton).toBeDisabled();
    expect(screen.getByText(/söker/i)).toBeInTheDocument();
  });

  // ============================================================
  // SEARCH INPUT TESTS
  // ============================================================

  it('should handle text search input', async () => {
    const user = userEvent.setup();
    render(<PropertySearch {...defaultProps} />);
    
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'Stockholm lägenhet');
    
    expect(searchInput).toHaveValue('Stockholm lägenhet');
  });

  it('should trigger search on form submission', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'test query');
    
    const searchButton = screen.getByRole('button', { name: /sök/i });
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      query: 'test query'
    }));
  });

  it('should trigger search on Enter key', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'test query{enter}');
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      query: 'test query'
    }));
  });

  // ============================================================
  // PROPERTY TYPE FILTER TESTS
  // ============================================================

  it('should handle property type selection', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    // Select multiple property types
    const villaCheckbox = screen.getByRole('checkbox', { name: /villa/i });
    const lagenhetCheckbox = screen.getByRole('checkbox', { name: /lägenhet/i });
    
    await user.click(villaCheckbox);
    await user.click(lagenhetCheckbox);
    
    expect(villaCheckbox).toBeChecked();
    expect(lagenhetCheckbox).toBeChecked();
    
    // Submit search
    const searchButton = screen.getByRole('button', { name: /sök/i });
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      propertyTypes: expect.arrayContaining(['villa', 'lagenhet'])
    }));
  });

  it('should show property type counts', () => {
    render(<PropertySearch {...defaultProps} />);
    
    // Should show counts next to each property type
    expect(screen.getByText('Villa (45)')).toBeInTheDocument();
    expect(screen.getByText('Lägenhet (123)')).toBeInTheDocument();
    expect(screen.getByText('Radhus (32)')).toBeInTheDocument();
  });

  // ============================================================
  // PRICE FILTER TESTS
  // ============================================================

  it('should handle price range selection', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    // Select price inputs
    const minPriceInput = screen.getByLabelText(/minpris/i);
    const maxPriceInput = screen.getByLabelText(/maxpris/i);
    
    await user.clear(minPriceInput);
    await user.type(minPriceInput, '2000000');
    
    await user.clear(maxPriceInput);
    await user.type(maxPriceInput, '5000000');
    
    expect(minPriceInput).toHaveValue(2000000);
    expect(maxPriceInput).toHaveValue(5000000);
    
    // Submit search
    const searchButton = screen.getByRole('button', { name: /sök/i });
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      priceMin: 2000000,
      priceMax: 5000000
    }));
  });

  it('should validate price range order', async () => {
    const user = userEvent.setup();
    render(<PropertySearch {...defaultProps} />);
    
    const minPriceInput = screen.getByLabelText(/minpris/i);
    const maxPriceInput = screen.getByLabelText(/maxpris/i);
    
    // Enter invalid range (min > max)
    await user.clear(minPriceInput);
    await user.type(minPriceInput, '5000000');
    
    await user.clear(maxPriceInput);
    await user.type(maxPriceInput, '2000000');
    
    // Blur to trigger validation
    await user.tab();
    
    // Should show validation error
    expect(screen.getByText(/minpris kan inte vara högre än maxpris/i)).toBeInTheDocument();
  });

  it('should handle price range preset selection', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    // Click on a price range preset
    const priceRangeButton = screen.getByText('2-5 miljoner (89)');
    await user.click(priceRangeButton);
    
    // Should fill in the min/max inputs
    expect(screen.getByLabelText(/minpris/i)).toHaveValue(2000000);
    expect(screen.getByLabelText(/maxpris/i)).toHaveValue(5000000);
  });

  // ============================================================
  // AREA FILTER TESTS
  // ============================================================

  it('should handle area range selection', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    const minAreaInput = screen.getByLabelText(/minyta/i);
    const maxAreaInput = screen.getByLabelText(/maxyta/i);
    
    await user.clear(minAreaInput);
    await user.type(minAreaInput, '50');
    
    await user.clear(maxAreaInput);
    await user.type(maxAreaInput, '150');
    
    const searchButton = screen.getByRole('button', { name: /sök/i });
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      areaMin: 50,
      areaMax: 150
    }));
  });

  it('should validate area range order', async () => {
    const user = userEvent.setup();
    render(<PropertySearch {...defaultProps} />);
    
    const minAreaInput = screen.getByLabelText(/minyta/i);
    const maxAreaInput = screen.getByLabelText(/maxyta/i);
    
    // Enter invalid range
    await user.clear(minAreaInput);
    await user.type(minAreaInput, '200');
    
    await user.clear(maxAreaInput);
    await user.type(maxAreaInput, '100');
    
    await user.tab();
    
    expect(screen.getByText(/minyta kan inte vara större än maxyta/i)).toBeInTheDocument();
  });

  // ============================================================
  // LOCATION FILTER TESTS
  // ============================================================

  it('should handle city selection', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    const citySelect = screen.getByRole('combobox', { name: /stad/i });
    await user.selectOptions(citySelect, 'Stockholm');
    
    expect(citySelect).toHaveValue('Stockholm');
    
    const searchButton = screen.getByRole('button', { name: /sök/i });
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      city: 'Stockholm'
    }));
  });

  it('should handle municipality selection', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    const municipalitySelect = screen.getByRole('combobox', { name: /kommun/i });
    await user.selectOptions(municipalitySelect, 'Solna');
    
    expect(municipalitySelect).toHaveValue('Solna');
    
    const searchButton = screen.getByRole('button', { name: /sök/i });
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      municipality: 'Solna'
    }));
  });

  // ============================================================
  // ROOM FILTER TESTS
  // ============================================================

  it('should handle room range selection', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    const minRoomsSelect = screen.getByRole('combobox', { name: /minrum/i });
    const maxRoomsSelect = screen.getByRole('combobox', { name: /maxrum/i });
    
    await user.selectOptions(minRoomsSelect, '2');
    await user.selectOptions(maxRoomsSelect, '4');
    
    const searchButton = screen.getByRole('button', { name: /sök/i });
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      roomsMin: 2,
      roomsMax: 4
    }));
  });

  // ============================================================
  // BUILD YEAR FILTER TESTS
  // ============================================================

  it('should handle build year range selection', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    const minYearInput = screen.getByLabelText(/äldst/i);
    const maxYearInput = screen.getByLabelText(/nyast/i);
    
    await user.clear(minYearInput);
    await user.type(minYearInput, '1950');
    
    await user.clear(maxYearInput);
    await user.type(maxYearInput, '2020');
    
    const searchButton = screen.getByRole('button', { name: /sök/i });
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      buildYearMin: 1950,
      buildYearMax: 2020
    }));
  });

  it('should validate build year range', async () => {
    const user = userEvent.setup();
    render(<PropertySearch {...defaultProps} />);
    
    const minYearInput = screen.getByLabelText(/äldst/i);
    const maxYearInput = screen.getByLabelText(/nyast/i);
    
    const currentYear = new Date().getFullYear();
    
    // Test year in future
    await user.clear(maxYearInput);
    await user.type(maxYearInput, String(currentYear + 5));
    await user.tab();
    
    expect(screen.getByText(/byggår kan inte vara i framtiden/i)).toBeInTheDocument();
    
    // Test invalid range
    await user.clear(minYearInput);
    await user.type(minYearInput, '2020');
    
    await user.clear(maxYearInput);
    await user.type(maxYearInput, '1990');
    await user.tab();
    
    expect(screen.getByText(/äldsta året kan inte vara senare än nyaste/i)).toBeInTheDocument();
  });

  // ============================================================
  // RESET FUNCTIONALITY TESTS
  // ============================================================

  it('should reset all filters when reset button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = jest.fn();
    
    render(<PropertySearch {...defaultProps} onReset={onReset} />);
    
    // Set some filters
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'test search');
    
    const villaCheckbox = screen.getByRole('checkbox', { name: /villa/i });
    await user.click(villaCheckbox);
    
    const minPriceInput = screen.getByLabelText(/minpris/i);
    await user.clear(minPriceInput);
    await user.type(minPriceInput, '2000000');
    
    // Click reset
    const resetButton = screen.getByRole('button', { name: /rensa filter/i });
    await user.click(resetButton);
    
    expect(onReset).toHaveBeenCalled();
    
    // Form should be reset
    expect(searchInput).toHaveValue('');
    expect(villaCheckbox).not.toBeChecked();
    expect(minPriceInput).toHaveValue(null);
  });

  // ============================================================
  // RESPONSIVE BEHAVIOR TESTS
  // ============================================================

  it('should collapse filters on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    render(<PropertySearch {...defaultProps} />);
    
    // Should have a toggle button for filters on mobile
    expect(screen.getByRole('button', { name: /visa filter/i })).toBeInTheDocument();
  });

  it('should expand/collapse filter sections on mobile', async () => {
    const user = userEvent.setup();
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    render(<PropertySearch {...defaultProps} />);
    
    const toggleButton = screen.getByRole('button', { name: /visa filter/i });
    await user.click(toggleButton);
    
    // Filters should be visible after clicking toggle
    expect(screen.getByText('Fastighetstyp')).toBeVisible();
  });

  // ============================================================
  // ACCESSIBILITY TESTS
  // ============================================================

  it('should have proper form labels and structure', () => {
    render(<PropertySearch {...defaultProps} />);
    
    // All form controls should have labels
    expect(screen.getByLabelText(/sökord/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minpris/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maxpris/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minyta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maxyta/i)).toBeInTheDocument();
    
    // Form should have proper structure
    const form = screen.getByRole('form') || screen.getByTestId('search-form');
    expect(form).toBeInTheDocument();
  });

  it('should announce validation errors to screen readers', async () => {
    const user = userEvent.setup();
    render(<PropertySearch {...defaultProps} />);
    
    const minPriceInput = screen.getByLabelText(/minpris/i);
    const maxPriceInput = screen.getByLabelText(/maxpris/i);
    
    // Create validation error
    await user.clear(minPriceInput);
    await user.type(minPriceInput, '5000000');
    
    await user.clear(maxPriceInput);
    await user.type(maxPriceInput, '2000000');
    await user.tab();
    
    const errorMessage = screen.getByText(/minpris kan inte vara högre än maxpris/i);
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<PropertySearch {...defaultProps} />);
    
    // Should be able to tab through all form controls
    await user.tab(); // Search input
    expect(screen.getByRole('searchbox')).toHaveFocus();
    
    await user.tab(); // First property type checkbox
    expect(screen.getAllByRole('checkbox')[0]).toHaveFocus();
  });

  // ============================================================
  // PERFORMANCE TESTS
  // ============================================================

  it('should debounce search input changes', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    const searchInput = screen.getByRole('searchbox');
    
    // Type quickly
    await user.type(searchInput, 'Stockholm');
    
    // onSearch should not be called immediately
    expect(onSearch).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
        query: 'Stockholm'
      }));
    }, { timeout: 1000 });
  });

  // ============================================================
  // ERROR HANDLING TESTS
  // ============================================================

  it('should handle missing filter options gracefully', () => {
    render(
      <PropertySearch 
        onSearch={jest.fn()} 
        onReset={jest.fn()}
        filterOptions={undefined}
      />
    );
    
    // Should still render basic search without crashing
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sök/i })).toBeInTheDocument();
  });

  it('should handle invalid initial filters', () => {
    const invalidFilters = {
      priceMin: 'invalid' as any,
      areaMax: -1,
      buildYearMin: 3000
    };
    
    render(
      <PropertySearch 
        {...defaultProps}
        initialFilters={invalidFilters}
      />
    );
    
    // Should render without errors
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  // ============================================================
  // INTEGRATION TESTS
  // ============================================================

  it('should combine multiple filter types in search', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<PropertySearch {...defaultProps} onSearch={onSearch} />);
    
    // Set multiple filters
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'Stockholm');
    
    const villaCheckbox = screen.getByRole('checkbox', { name: /villa/i });
    await user.click(villaCheckbox);
    
    const minPriceInput = screen.getByLabelText(/minpris/i);
    await user.clear(minPriceInput);
    await user.type(minPriceInput, '2000000');
    
    const citySelect = screen.getByRole('combobox', { name: /stad/i });
    await user.selectOptions(citySelect, 'Stockholm');
    
    // Submit search
    const searchButton = screen.getByRole('button', { name: /sök/i });
    await user.click(searchButton);
    
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
      query: 'Stockholm',
      propertyTypes: ['villa'],
      priceMin: 2000000,
      city: 'Stockholm'
    }));
  });
});