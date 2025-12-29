import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectShowcase from '../components/ProjectShowcase';
import { ProjectContext } from '../context/ProjectContext';

const mockProjects = [
  { id: 1, name: 'Test Residential', location: 'Test Area', price: 1000000, bedrooms: 2, roi: 8, appreciation: 10, amenities: [], description: '', completionDate: '', units: 10 },
  { id: 2, name: 'Test Office', location: 'Test Area', price: 2000000, type: 'Office Space', roi: 7, appreciation: 9, amenities: [], description: '', completionDate: '', units: 20 }
];

describe('ProjectShowcase', () => {
  it('renders best-selling projects by type', () => {
    render(
      <ProjectContext.Provider value={{ projects: mockProjects, loading: false }}>
        <ProjectShowcase filters={{ budget: { min: 0, max: 5000000 }, area: ['Test Area'], propertyType: [] }} selectedProjects={[]} setSelectedProjects={() => {}} />
      </ProjectContext.Provider>
    );
    expect(screen.getByText(/Best-Selling Residential/i)).toBeInTheDocument();
    expect(screen.getByText(/Best-Selling Office Space/i)).toBeInTheDocument();
  });
});
