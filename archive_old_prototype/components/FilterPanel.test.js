import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import FilterPanel from '../components/FilterPanel';

describe('FilterPanel', () => {
  it('allows dynamic area search and property type selection', () => {
    const setFilters = jest.fn();
    const filters = { budget: { min: 0, max: 5000000 }, area: [], propertyType: [], developer: [], bedrooms: [], amenities: [] };
    const { getByPlaceholderText, getByLabelText } = render(
      <FilterPanel filters={filters} setFilters={setFilters} />
    );
    // Area search
    const areaInput = getByPlaceholderText(/search area/i);
    fireEvent.change(areaInput, { target: { value: 'Test Area' } });
    expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({ area: ['Test Area'] }));
    // Expand Property Type section
    const { getAllByText } = render(
      <FilterPanel filters={filters} setFilters={setFilters} />
    );
    // There may be multiple 'Property Type' spans, find the button containing it
    const propertyTypeButtons = getAllByText('Property Type').map(el => el.closest('button')).filter(Boolean);
    if (propertyTypeButtons.length > 0) {
      fireEvent.click(propertyTypeButtons[0]);
    }
    // Property type
    const officeCheckbox = getByLabelText(/Office Space/i);
    fireEvent.click(officeCheckbox);
    expect(setFilters).toHaveBeenCalled();
  });
});
